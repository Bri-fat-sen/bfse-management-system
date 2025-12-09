import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Paperclip,
  Image as ImageIcon,
  FileText,
  Package,
  X,
  Upload,
  Loader2,
  Search,
  File,
  Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";

export default function AttachmentPicker({
  orgId,
  onAttach,
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef(null);

  const { data: products = [] } = useQuery({
    queryKey: ['products', orgId],
    queryFn: () => base44.entities.Product.filter({ organisation_id: orgId, is_active: true }),
    enabled: !!orgId && isOpen,
  });

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const isImage = file.type.startsWith('image/');
      
      onAttach({
        type: isImage ? 'image' : 'file',
        url: file_url,
        name: file.name,
        size: file.size,
        mimeType: file.type
      });
      
      toast.success("File attached");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleProductAttach = (product) => {
    onAttach({
      type: 'product',
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      productPrice: product.unit_price,
      productImage: product.image_url,
      productStock: product.stock_quantity
    });
    toast.success("Product attached");
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-gray-500 hover:text-gray-700"
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Paperclip className="w-4 h-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-10 rounded-b-none">
            <TabsTrigger value="file" className="text-xs gap-1">
              <FileText className="w-3 h-3" />
              Files
            </TabsTrigger>
            <TabsTrigger value="product" className="text-xs gap-1">
              <Package className="w-3 h-3" />
              Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="p-3 space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => {
                  fileInputRef.current.accept = 'image/*';
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
              >
                <ImageIcon className="w-6 h-6 text-blue-500" />
                <span className="text-xs">Image</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => {
                  fileInputRef.current.accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt';
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
              >
                <File className="w-6 h-6 text-green-500" />
                <span className="text-xs">Document</span>
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                fileInputRef.current.accept = '*/*';
                fileInputRef.current?.click();
              }}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4" />
              Upload Any File
            </Button>
          </TabsContent>

          <TabsContent value="product" className="p-0">
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>
            
            <ScrollArea className="h-[200px]">
              {filteredProducts.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">No products found</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredProducts.slice(0, 20).map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductAttach(product)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer group"
                    >
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt="" 
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{product.sku}</span>
                          <Badge variant="secondary" className="text-[10px]">
                            Le {product.unit_price?.toLocaleString()}
                          </Badge>
                        </div>
                      </div>
                      <Link2 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

// Attachment preview component for displaying attached items before sending
export function AttachmentPreview({ attachment, onRemove }) {
  if (!attachment) return null;

  return (
    <div className="mx-3 mb-2 p-2 bg-gray-50 rounded-lg border flex items-center gap-2">
      {attachment.type === 'image' && (
        <>
          <img src={attachment.url} alt="" className="w-12 h-12 rounded object-cover" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{attachment.name}</p>
            <p className="text-xs text-gray-500">Image</p>
          </div>
        </>
      )}
      
      {attachment.type === 'file' && (
        <>
          <div className="w-12 h-12 rounded bg-blue-100 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{attachment.name}</p>
            <p className="text-xs text-gray-500">Document</p>
          </div>
        </>
      )}
      
      {attachment.type === 'product' && (
        <>
          {attachment.productImage ? (
            <img src={attachment.productImage} alt="" className="w-12 h-12 rounded object-cover" />
          ) : (
            <div className="w-12 h-12 rounded bg-green-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{attachment.productName}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{attachment.productSku}</span>
              <Badge variant="secondary" className="text-[10px]">
                Le {attachment.productPrice?.toLocaleString()}
              </Badge>
            </div>
          </div>
        </>
      )}
      
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 flex-shrink-0"
        onClick={onRemove}
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
}

// Component to render attachments in messages
export function MessageAttachment({ attachment, isOwn }) {
  if (!attachment) return null;

  const bgClass = isOwn ? 'bg-white/20' : 'bg-white';

  if (attachment.type === 'image') {
    return (
      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
        <img 
          src={attachment.url} 
          alt="" 
          className="max-w-[200px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
        />
      </a>
    );
  }

  if (attachment.type === 'file') {
    return (
      <a 
        href={attachment.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`flex items-center gap-2 p-2 rounded-lg ${bgClass} hover:opacity-90 transition-opacity`}
      >
        <FileText className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm truncate max-w-[150px]">{attachment.name}</span>
      </a>
    );
  }

  if (attachment.type === 'product') {
    return (
      <div className={`p-2 rounded-lg ${bgClass}`}>
        <div className="flex items-center gap-2">
          {attachment.productImage ? (
            <img src={attachment.productImage} alt="" className="w-12 h-12 rounded object-cover" />
          ) : (
            <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium">{attachment.productName}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs opacity-70">{attachment.productSku}</span>
              <Badge variant="secondary" className="text-[10px] bg-white/30">
                Le {attachment.productPrice?.toLocaleString()}
              </Badge>
              <Badge 
                variant={attachment.productStock > 0 ? "outline" : "destructive"} 
                className="text-[10px]"
              >
                {attachment.productStock > 0 ? `${attachment.productStock} in stock` : 'Out of stock'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}