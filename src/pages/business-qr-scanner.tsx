import { useState, useRef } from 'react';
import { useLocation } from 'wouter';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2, QrCode, Upload, Camera } from 'lucide-react';
import { useRequireRole } from '@/hooks/useRequireRole';
import { Html5Qrcode } from 'html5-qrcode';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function BusinessQRScannerPage() {
  useRequireRole('business', '/login/business');
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  const startLiveScanning = async () => {
    if (!scannerContainerRef.current) return;

    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        () => {
          // Ignore scanning errors
        }
      );

      setScanning(true);
      setResult(null);
    } catch (err: any) {
      console.error('Failed to start scanner:', err);
      setResult({
        success: false,
        message: err.message || 'Failed to start camera. Please check permissions.',
      });
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setVerifying(true);
    setResult(null);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix if present
          const base64Data = result.includes(',') ? result.split(',')[1] : result;
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Create base64 data URL
      const base64DataUrl = `data:image/jpeg;base64,${base64}`;

      // Send image to backend for QR code decoding
      const decodeRes = await fetch(`${API_BASE_URL}/orders/decode-qr-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ image: base64DataUrl }),
      });

      const decodeResponse = await decodeRes.json();

      if (decodeResponse.success && decodeResponse.data?.qrData) {
        await handleScan(decodeResponse.data.qrData);
      } else {
        setResult({
          success: false,
          message: decodeResponse.message || 'No QR code found in the image. Please try another image or use the live camera scanner.',
        });
        setVerifying(false);
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Failed to read QR code from image. Please try another image or use the live camera scanner.',
      });
      setVerifying(false);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCaptureClick = () => {
    fileInputRef.current?.click();
  };

  const handleScan = async (data: string) => {
    if (verifying) return;

    await stopScanning();
    setVerifying(true);
    setResult(null);

    try {
      let qrData;
      try {
        qrData = JSON.parse(data);
      } catch {
        qrData = { orderId: data }; // Fallback for simple order ID
      }

      const res = await fetch(`${API_BASE_URL}/orders/verify-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ qrData }),
      });

      const response = await res.json();
      setResult({
        success: response.success,
        message: response.message || (response.success ? 'Order verified successfully' : 'Verification failed'),
        data: response.data,
      });

      if (response.success) {
        // Auto-redirect to order detail after 2 seconds
        setTimeout(() => {
          setLocation(`/business/orders/${response.data.id}`);
        }, 2000);
      } else {
        // Allow rescan after 3 seconds
        setTimeout(() => {
          setResult(null);
        }, 3000);
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || 'Failed to verify QR code',
      });
      setTimeout(() => {
        setResult(null);
      }, 3000);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scan Order QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {!scanning && !verifying && !result && (
              <div className="flex flex-col items-center gap-4 py-8">
                <QrCode className="h-16 w-16 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Capture or upload an image containing a QR code to scan
                </p>
                <div className="flex flex-col gap-3 w-full max-w-sm">
                  <Button onClick={handleCaptureClick} size="lg" className="w-full">
                    <Camera className="h-4 w-4 mr-2" />
                    Capture QR Code
                  </Button>
                  <Button onClick={handleCaptureClick} variant="outline" size="lg" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                  <Button onClick={startLiveScanning} variant="ghost" size="lg" className="w-full">
                    Use Live Camera
                  </Button>
                </div>
              </div>
            )}

            {scanning && (
              <div className="relative">
                <div id="qr-reader" ref={scannerContainerRef} className="w-full" />
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" onClick={stopScanning}>
                    Stop Scanner
                  </Button>
                </div>
              </div>
            )}

            {verifying && (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p>Verifying QR code...</p>
              </div>
            )}

            {result && (
              <Alert variant={result.success ? 'default' : 'destructive'}>
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  <AlertDescription>{result.message}</AlertDescription>
                </div>
              </Alert>
            )}

            {!scanning && !verifying && result && (
              <div className="space-y-2">
                {result.data && (
                  <div className="text-sm space-y-1 p-4 bg-muted rounded-lg">
                    <p>
                      <strong>Order ID:</strong> {result.data.id?.substring(0, 8).toUpperCase()}
                    </p>
                    {result.data.customerName && (
                      <p>
                        <strong>Customer:</strong> {result.data.customerName}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setResult(null);
                    }}
                    className="flex-1"
                  >
                    Scan Another QR Code
                  </Button>
                  {result.success && result.data?.id && (
                    <Button
                      variant="outline"
                      onClick={() => setLocation(`/business/orders/${result.data.id}`)}
                      className="flex-1"
                    >
                      View Order
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

