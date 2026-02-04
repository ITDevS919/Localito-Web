import { useEffect, useState, useRef } from "react";
import { AdminDashboardLayout } from "@/components/layout/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle, Send, Loader2, Plus, Users, Eye } from "lucide-react";
import { useRequireRole } from "@/hooks/useRequireRole";
import { useAuth } from "@/contexts/AuthContext";
import { initializeFirebaseAuth } from "@/lib/firebase";
import {
  subscribeToUserChatRooms,
  subscribeToMessages,
  sendMessage,
  markMessagesAsRead,
  getOrCreateChatRoom,
  type Message,
  type ChatRoom,
} from "@/services/chatService";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Business {
  id: string;
  business_name: string;
  user_id: string;
  email: string;
  username: string;
}

interface Customer {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AdminConversationRoom {
  id: string;
  participantNames: Record<string, string>;
  participantRoles: Record<string, string>;
  appUserIds?: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  type: string;
  createdAt?: string;
}

interface AdminMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  text: string;
  timestamp: string;
  read: boolean;
  type: string;
}

export default function AdminMessagesPage() {
  useRequireRole("admin", "/admin");
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [newConversationOpen, setNewConversationOpen] = useState(false);
  const [recipientType, setRecipientType] = useState<"business" | "customer">("business");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [viewMode, setViewMode] = useState<"mine" | "buyer-seller">("mine");
  const [buyerSellerRooms, setBuyerSellerRooms] = useState<AdminConversationRoom[]>([]);
  const [selectedBuyerSellerRoomId, setSelectedBuyerSellerRoomId] = useState<string | null>(null);
  const [buyerSellerMessages, setBuyerSellerMessages] = useState<AdminMessage[]>([]);
  const [loadingBuyerSellerRooms, setLoadingBuyerSellerRooms] = useState(false);
  const [loadingBuyerSellerMessages, setLoadingBuyerSellerMessages] = useState(false);
  const [buyerSellerError, setBuyerSellerError] = useState<string | null>(null);

  // Initialize Firebase auth on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initializeFirebaseAuth();
      } catch (error) {
        console.error("Failed to initialize Firebase auth:", error);
      } finally {
        setInitializing(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!user || initializing) return;

    console.log("Subscribing to chat rooms for admin:", user.id);

    const unsubscribe = subscribeToUserChatRooms(user.id, (updatedRooms) => {
      // Show all room types (support, admin_initiated, buyer-seller)
      console.log(`Received ${updatedRooms.length} rooms`);
      setRooms(updatedRooms);
    });

    return () => unsubscribe();
  }, [user, initializing]);

  useEffect(() => {
    if (!newConversationOpen) return;
    if (recipientType === "business" && businesses.length === 0) loadBusinesses();
    if (recipientType === "customer" && customers.length === 0) loadCustomers();
  }, [newConversationOpen, recipientType]);

  // Fetch buyer-seller conversations when admin switches to that view
  useEffect(() => {
    if (viewMode !== "buyer-seller") return;
    setLoadingBuyerSellerRooms(true);
    setBuyerSellerError(null);
    fetch(`${API_BASE_URL}/admin/conversations`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setBuyerSellerRooms(data.data || []);
        else setBuyerSellerError(data.message || "Failed to load conversations");
      })
      .catch(() => setBuyerSellerError("Failed to load conversations"))
      .finally(() => setLoadingBuyerSellerRooms(false));
  }, [viewMode]);

  // Fetch messages for selected buyer-seller room
  useEffect(() => {
    if (viewMode !== "buyer-seller" || !selectedBuyerSellerRoomId) {
      setBuyerSellerMessages([]);
      return;
    }
    setLoadingBuyerSellerMessages(true);
    fetch(`${API_BASE_URL}/admin/conversations/${selectedBuyerSellerRoomId}/messages`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setBuyerSellerMessages(data.data || []);
      })
      .catch(() => setBuyerSellerMessages([]))
      .finally(() => setLoadingBuyerSellerMessages(false));
  }, [viewMode, selectedBuyerSellerRoomId]);

  const loadBusinesses = async () => {
    setLoadingBusinesses(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/businesses?status=approved&limit=100`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBusinesses(data.data.businesses || []);
      }
    } catch (error) {
      console.error("Failed to load businesses:", error);
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const loadCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users?role=customer&limit=100`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCustomers(data.data.users || []);
      }
    } catch (error) {
      console.error("Failed to load customers:", error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleCreateConversation = async () => {
    if (!user || creatingRoom) return;

    if (recipientType === "business") {
      if (!selectedBusinessId) return;
      const business = businesses.find((b) => b.id === selectedBusinessId);
      if (!business) return;

      setCreatingRoom(true);
      try {
        const roomId = await getOrCreateChatRoom(
          user.id,
          business.user_id,
          user.username,
          business.business_name,
          user.role || "admin",
          "business",
          "admin_initiated"
        );

        const newRoom = rooms.find((r) => r.id === roomId);
        if (newRoom) setSelectedRoom(newRoom);

        setNewConversationOpen(false);
        setSelectedBusinessId("");
      } catch (error) {
        console.error("Failed to create conversation:", error);
      } finally {
        setCreatingRoom(false);
      }
      return;
    }

    // Customer
    if (!selectedCustomerId) return;
    const customer = customers.find((c) => c.id === selectedCustomerId);
    if (!customer) return;

    setCreatingRoom(true);
    try {
      const roomId = await getOrCreateChatRoom(
        user.id,
        customer.id,
        user.username,
        customer.username || customer.email,
        user.role || "admin",
        "customer",
        "admin_initiated"
      );

      const newRoom = rooms.find((r) => r.id === roomId);
      if (newRoom) setSelectedRoom(newRoom);

      setNewConversationOpen(false);
      setSelectedCustomerId("");
    } catch (error) {
      console.error("Failed to create conversation:", error);
    } finally {
      setCreatingRoom(false);
    }
  };

  const canStartConversation =
    (recipientType === "business" && selectedBusinessId) ||
    (recipientType === "customer" && selectedCustomerId);

  useEffect(() => {
    if (!selectedRoom || !user) return;

    const unsubscribe = subscribeToMessages(selectedRoom.id, (updatedMessages) => {
      setMessages(updatedMessages);
      // Mark as read
      markMessagesAsRead(selectedRoom.id, user.id);
    });

    return () => unsubscribe();
  }, [selectedRoom, user]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedRoom || !user || sending) return;

    setSending(true);
    try {
      // Use appUserIds to find the other participant (excludes Firebase auth UIDs)
      const appUserIds = selectedRoom.appUserIds || selectedRoom.participants;
      const otherParticipant = appUserIds.find((id) => id !== user.id);
      if (!otherParticipant) {
        console.error("Could not find other participant");
        return;
      }

      await sendMessage(
        selectedRoom.id,
        user.id,
        user.username,
        user.role as "customer" | "business" | "admin",
        otherParticipant,
        selectedRoom.participantNames[otherParticipant] || "Unknown",
        messageText.trim(),
        selectedRoom.type
      );
      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = (room: ChatRoom) => {
    if (!user) return null;
    // Use appUserIds to find the other participant (excludes Firebase auth UIDs)
    const appUserIds = room.appUserIds || room.participants;
    const otherId = appUserIds.find((id) => id !== user.id);
    return otherId ? room.participantNames[otherId] : null;
  };

  const getOtherParticipantRole = (room: ChatRoom) => {
    if (!user) return null;
    const appUserIds = room.appUserIds || room.participants;
    const otherId = appUserIds.find((id) => id !== user.id);
    return otherId ? room.participantRoles[otherId] : null;
  };

  const getUnreadCount = (room: ChatRoom) => {
    if (!user) return 0;
    return room.unreadCount[user.id] || 0;
  };

  if (initializing) {
    return (
      <AdminDashboardLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </AdminDashboardLayout>
    );
  }

  const selectedBuyerSellerRoom = buyerSellerRooms.find((r) => r.id === selectedBuyerSellerRoomId);
  const buyerSellerParticipantNames = selectedBuyerSellerRoom
    ? Object.values(selectedBuyerSellerRoom.participantNames).filter(Boolean).join(" & ")
    : "";

  return (
    <AdminDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Messages</h1>
            <p className="text-muted-foreground">Chat with customers and businesses, or view buyer-seller conversations</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border bg-muted/50 p-1">
              <button
                type="button"
                onClick={() => setViewMode("mine")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === "mine" ? "bg-background shadow" : "hover:bg-background/50"
                }`}
              >
                <MessageCircle className="h-4 w-4 inline-block mr-2 align-middle" />
                My conversations
              </button>
              <button
                type="button"
                onClick={() => setViewMode("buyer-seller")}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === "buyer-seller" ? "bg-background shadow" : "hover:bg-background/50"
                }`}
              >
                <Eye className="h-4 w-4 inline-block mr-2 align-middle" />
                View buyer-seller
              </button>
            </div>
            {viewMode === "mine" && (
              <Button onClick={() => setNewConversationOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Conversation
              </Button>
            )}
          </div>
        </div>

        {viewMode === "buyer-seller" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: "calc(100vh - 250px)" }}>
            <Card className="lg:col-span-1 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Buyer-seller conversations
                </CardTitle>
                <p className="text-sm text-muted-foreground">Read-only. Configure Firebase Admin to enable.</p>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-hidden">
                {buyerSellerError && (
                  <div className="p-4 text-sm text-destructive">{buyerSellerError}</div>
                )}
                {loadingBuyerSellerRooms ? (
                  <div className="p-4 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : buyerSellerRooms.length === 0 && !buyerSellerError ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No buyer-seller conversations yet</p>
                  </div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="divide-y">
                      {buyerSellerRooms.map((room) => {
                        const names = Object.values(room.participantNames).filter(Boolean).join(" & ") || "Unknown";
                        return (
                          <button
                            key={room.id}
                            type="button"
                            onClick={() => setSelectedBuyerSellerRoomId(room.id)}
                            className={`w-full p-4 text-left hover:bg-secondary/50 transition-colors ${
                              selectedBuyerSellerRoomId === room.id ? "bg-secondary" : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>{names.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{names}</p>
                                {room.lastMessageTime && (
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(room.lastMessageTime).toLocaleDateString()}
                                  </span>
                                )}
                                <p className="text-sm text-muted-foreground truncate">{room.lastMessage || "No messages"}</p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
            <Card className="lg:col-span-2 flex flex-col">
              {selectedBuyerSellerRoomId ? (
                <>
                  <CardHeader className="border-b shrink-0">
                    <CardTitle>{buyerSellerParticipantNames || "Conversation"}</CardTitle>
                    <p className="text-sm text-muted-foreground">Read-only view of messages between customer and business</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-auto">
                    {loadingBuyerSellerMessages ? (
                      <div className="p-8 flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : buyerSellerMessages.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">No messages in this conversation</div>
                    ) : (
                      <div className="p-4 space-y-4">
                        {buyerSellerMessages.map((msg) => (
                          <div key={msg.id} className="flex flex-col gap-1">
                            <div
                              className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                                msg.senderRole === "admin"
                                  ? "bg-primary text-primary-foreground rounded-br-sm ml-auto"
                                  : "bg-secondary text-secondary-foreground rounded-bl-sm"
                              }`}
                            >
                              <p className="text-xs font-medium opacity-80">
                                {msg.senderName} ({msg.senderRole})
                              </p>
                              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                              <p className="text-xs mt-1 opacity-70">
                                {new Date(msg.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Eye className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Select a conversation to view messages</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: 'calc(100vh - 250px)' }}>
          {/* Chat Rooms List */}
          <Card className="lg:col-span-1 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                {rooms.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {rooms.map((room) => {
                      const otherName = getOtherParticipant(room);
                      const otherRole = getOtherParticipantRole(room);
                      const unread = getUnreadCount(room);
                      return (
                        <button
                          key={room.id}
                          onClick={() => setSelectedRoom(room)}
                          className={`w-full p-4 text-left hover:bg-secondary/50 transition-colors ${
                            selectedRoom?.id === room.id ? "bg-secondary" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {otherName?.substring(0, 2).toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium truncate">{otherName || "Unknown"}</p>
                                {room.lastMessageTime && (
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(room.lastMessageTime).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge 
                                  variant={otherRole === "business" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {otherRole || "User"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {room.lastMessage || "No messages"}
                              </p>
                            </div>
                            {unread > 0 && (
                              <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                {unread}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedRoom ? (
              <>
                <CardHeader className="border-b shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getOtherParticipant(selectedRoom) || "Unknown"}
                        <Badge variant="secondary" className="text-xs">
                          {getOtherParticipantRole(selectedRoom) || "User"}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedRoom.type === "support" && "Support conversation"}
                        {selectedRoom.type === "admin_initiated" && "Admin-initiated conversation"}
                        {selectedRoom.type === "buyer-seller" && "Buyer-seller conversation"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                  <ScrollArea className="flex-1 min-h-0">
                    <div className="p-4 space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((message) => {
                          const isOwn = message.senderId === user?.id;
                          return (
                            <div
                              key={message.id}
                              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${
                                  isOwn
                                    ? "bg-primary text-primary-foreground rounded-br-sm"
                                    : "bg-secondary text-secondary-foreground rounded-bl-sm"
                                }`}
                              >
                                {!isOwn && (
                                  <p className="text-xs font-medium mb-1 opacity-80">
                                    {message.senderName}
                                  </p>
                                )}
                                <p className="text-sm whitespace-pre-wrap wrap-break-word">{message.text}</p>
                                <p className="text-xs mt-1 opacity-70">
                                  {new Date(message.timestamp).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  <div className="border-t p-4 shrink-0">
                    <div className="flex gap-2">
                      <Input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder="Type a message..."
                        disabled={sending}
                      />
                      <Button onClick={handleSendMessage} disabled={sending || !messageText.trim()}>
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </div>
        )}
      </div>

      {/* New Conversation Dialog */}
      <Dialog
        open={newConversationOpen}
        onOpenChange={(open) => {
          setNewConversationOpen(open);
          if (!open) {
            setSelectedBusinessId("");
            setSelectedCustomerId("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
            <DialogDescription>
              Choose whether to message a business or a customer, then select who to start a conversation with.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient type</label>
              <Select
                value={recipientType}
                onValueChange={(v: "business" | "customer") => {
                  setRecipientType(v);
                  setSelectedBusinessId("");
                  setSelectedCustomerId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {recipientType === "business" ? "Select a business" : "Select a customer"}
              </label>
              {recipientType === "business" ? (
                loadingBusinesses ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a business" />
                    </SelectTrigger>
                    <SelectContent>
                      {businesses.map((business) => (
                        <SelectItem key={business.id} value={business.id}>
                          {business.business_name} ({business.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              ) : loadingCustomers ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.username || customer.email} ({customer.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNewConversationOpen(false);
                setSelectedBusinessId("");
                setSelectedCustomerId("");
              }}
              disabled={creatingRoom}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateConversation} disabled={!canStartConversation || creatingRoom}>
              {creatingRoom ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Start Conversation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminDashboardLayout>
  );
}

