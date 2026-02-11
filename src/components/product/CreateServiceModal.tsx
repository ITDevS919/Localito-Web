import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Upload, X, Image as ImageIcon, Clock, Users, MapPin } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  images: string[];
  duration_minutes: number;
  max_participants: number;
  requires_staff: boolean;
  location_type: 'onsite' | 'customer_address' | 'online';
}

interface CreateServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  service?: Service | null; // Optional service for edit mode
}

export function CreateServiceModal({
  open,
  onOpenChange,
  onSuccess,
  service,
}: CreateServiceModalProps) {
  const isEditMode = !!service;
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    duration_minutes: "60",
    max_participants: "1",
    requires_staff: false,
    location_type: "onsite" as 'onsite' | 'customer_address' | 'online',
    imageUrl: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<{
    file: File;
    preview: string;
    dataUrl: string;
  } | null>(null);
  const [imageMethod, setImageMethod] = useState<"upload" | "url">("url");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // Fetch service subcategories only (Cleaners, Hairdressers, Massage Therapists, etc.)
  useEffect(() => {
    if (open) {
      const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
          const res = await fetch(`${API_BASE_URL}/categories?for=service`);
          const data = await res.json();
          if (res.ok && data.success) {
            setCategories(data.data || []);
          }
        } catch (err) {
          console.error("Failed to fetch categories:", err);
        } finally {
          setLoadingCategories(false);
        }
      };
      fetchCategories();
    }
  }, [open]);

  // Populate form when service changes (edit mode)
  useEffect(() => {
    if (service && open) {
      setFormData({
        name: service.name || "",
        description: service.description || "",
        price: service.price?.toString() || "",
        category: service.category || "",
        duration_minutes: service.duration_minutes?.toString() || "60",
        max_participants: service.max_participants?.toString() || "1",
        requires_staff: service.requires_staff || false,
        location_type: service.location_type || "onsite",
        imageUrl: service.images?.[0] || "",
      });
      setImageMethod("url");
      setUploadedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else if (!service && open) {
      // Reset form for create mode
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        duration_minutes: "60",
        max_participants: "1",
        requires_staff: false,
        location_type: "onsite",
        imageUrl: "",
      });
      setUploadedImage(null);
      setImageMethod("upload");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [service, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (!formData.name.trim()) {
      setError("Service name is required");
      setLoading(false);
      return;
    }
    if (!formData.description.trim()) {
      setError("Description is required");
      setLoading(false);
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Valid price is required");
      setLoading(false);
      return;
    }
    if (!formData.duration_minutes || parseInt(formData.duration_minutes) <= 0) {
      setError("Valid duration is required");
      setLoading(false);
      return;
    }
    if (!formData.max_participants || parseInt(formData.max_participants) < 1) {
      setError("Max participants must be at least 1");
      setLoading(false);
      return;
    }
    if (!formData.category) {
      setError("Category is required");
      setLoading(false);
      return;
    }

    try {
      // Determine image source: uploaded file or URL
      let images: string[] = [];
      if (imageMethod === "upload" && uploadedImage) {
        images = [uploadedImage.dataUrl];
      } else if (imageMethod === "url" && formData.imageUrl.trim()) {
        images = [formData.imageUrl.trim()];
      } else if (isEditMode && service?.images?.[0]) {
        images = [service.images[0]];
      }

      const url = isEditMode
        ? `${API_BASE_URL}/services/${service.id}`
        : `${API_BASE_URL}/services`;
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          category: formData.category,
          images,
          durationMinutes: parseInt(formData.duration_minutes),
          maxParticipants: parseInt(formData.max_participants),
          requiresStaff: formData.requires_staff,
          locationType: formData.location_type,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || `Failed to ${isEditMode ? "update" : "create"} service`
        );
      }

      // Reset form only in create mode
      if (!isEditMode) {
        setFormData({
          name: "",
          description: "",
          price: "",
          category: "",
          duration_minutes: "60",
          max_participants: "1",
          requires_staff: false,
          location_type: "onsite",
          imageUrl: "",
        });
        setUploadedImage(null);
        setImageMethod("upload");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      setError(
        err.message ||
          `Failed to ${isEditMode ? "update" : "create"} service. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setUploadedImage({
        file,
        preview: URL.createObjectURL(file),
        dataUrl,
      });
    };
    reader.onerror = () => {
      setError("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveUploadedImage = () => {
    if (uploadedImage?.preview) {
      URL.revokeObjectURL(uploadedImage.preview);
    }
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Service" : "Create New Service"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update your service information. Changes will require admin approval if the service was previously approved."
              : "Add a new bookable service to your store. Services require admin approval before being visible to customers."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., Professional Haircut"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe your service..."
              rows={4}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (£) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                placeholder="0.00"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">
                <Clock className="inline h-4 w-4 mr-1" />
                Duration (minutes) *
              </Label>
              <Input
                id="duration_minutes"
                type="number"
                min="1"
                value={formData.duration_minutes}
                onChange={(e) => handleChange("duration_minutes", e.target.value)}
                placeholder="60"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_participants">
                <Users className="inline h-4 w-4 mr-1" />
                Max Participants
              </Label>
              <Input
                id="max_participants"
                type="number"
                min="1"
                value={formData.max_participants}
                onChange={(e) => handleChange("max_participants", e.target.value)}
                placeholder="1"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_type">
                <MapPin className="inline h-4 w-4 mr-1" />
                Location Type *
              </Label>
              <Select
                value={formData.location_type}
                onValueChange={(value) => handleChange("location_type", value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onsite">At Business Location</SelectItem>
                  <SelectItem value="customer_address">At Customer Address</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleChange("category", value)}
              disabled={loading || loadingCategories || categories.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select a category"} />
              </SelectTrigger>
              <SelectContent>
                {categories.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {loadingCategories ? "Loading..." : "No categories available"}
                  </div>
                ) : (
                  categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="requires_staff"
              checked={formData.requires_staff}
              onCheckedChange={(checked) =>
                handleChange("requires_staff", checked === true)
              }
              disabled={loading}
            />
            <Label htmlFor="requires_staff" className="cursor-pointer">
              Requires Staff Member
            </Label>
          </div>

          <div className="space-y-3">
            <Label>Service Image</Label>
            
            {/* Method Selection */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant={imageMethod === "upload" ? "default" : "outline"}
                size="sm"
                onClick={() => setImageMethod("upload")}
                disabled={loading}
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
              <Button
                type="button"
                variant={imageMethod === "url" ? "default" : "outline"}
                size="sm"
                onClick={() => setImageMethod("url")}
                disabled={loading}
                className="flex-1"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Use URL
              </Button>
            </div>

            {/* Upload Method */}
            {imageMethod === "upload" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={loading}
                    className="hidden"
                    id="imageFile"
                  />
                  <Label
                    htmlFor="imageFile"
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-full aspect-square max-w-sm mx-auto border-2 border-dashed border-border rounded-lg hover:bg-secondary/50 transition-colors overflow-hidden">
                      {uploadedImage ? (
                        <div className="relative w-full h-full">
                          <img
                            src={uploadedImage.preview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={handleRemoveUploadedImage}
                            disabled={loading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Upload className="h-8 w-8" />
                          <span className="text-sm">
                            {isEditMode ? "Click to upload new image" : "Click to upload image"}
                          </span>
                          <span className="text-xs">PNG, JPG up to 5MB</span>
                        </div>
                      )}
                    </div>
                  </Label>
                </div>
                {isEditMode && service?.images?.[0] && !uploadedImage && (
                  <p className="text-xs text-muted-foreground">
                    Current image will be kept if no new image is uploaded
                  </p>
                )}
              </div>
            )}

            {/* URL Method */}
            {imageMethod === "url" && (
              <div className="space-y-2">
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => handleChange("imageUrl", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  disabled={loading}
                />
                {formData.imageUrl && (
                  <div className="mt-2 aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg border border-border">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {isEditMode
                ? "Optional: Update service image"
                : "Optional: Add a service image. You can add more images later."}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditMode ? "Update Service" : "Create Service"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

