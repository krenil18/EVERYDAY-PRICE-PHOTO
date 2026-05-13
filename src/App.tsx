/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  Image as ImageIcon,
  Check,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';

interface Product {
  id: string;
  image: string | null;
  sku: string;
  price: string;
}

export default function App() {
  const [background, setBackground] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [displayDate, setDisplayDate] = useState<string>('12/05/26');
  const [headerInfo, setHeaderInfo] = useState<string>('18KT GOLD\nEF-VVS NATURAL DIAMONDS');
  const [footerText, setFooterText] = useState<string>('ORDER NOW (WHATSAPP) - +91 92741 41318');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imgScale, setImgScale] = useState(1.0);
  const [textScale, setTextScale] = useState(0.28);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Enforce 1-6 products
  useEffect(() => {
    if (products.length < 1) {
      const newProd = {
        id: Math.random().toString(36).substr(2, 9),
        image: null,
        sku: '',
        price: '',
      };
      setProducts([newProd]);
    }
  }, [products]);

  const addProduct = () => {
    if (products.length >= 6) return;
    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      image: null,
      sku: '',
      price: '',
    };
    setProducts([...products, newProduct]);
  };

  const removeProduct = (id: string) => {
    if (products.length <= 1) return;
    setProducts(products.filter(p => p.id !== id));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setBackground(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleProductImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => updateProduct(id, { image: event.target?.result as string });
      reader.readAsDataURL(file);
    }
  };

  const drawOnCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsGenerating(true);

    try {
      // Load background - use original size
      if (background) {
        const bgImg = new Image();
        bgImg.src = background;
        await new Promise((resolve) => { bgImg.onload = resolve; });
        
        canvas.width = bgImg.naturalWidth;
        canvas.height = bgImg.naturalHeight;
        ctx.drawImage(bgImg, 0, 0);
      } else {
        canvas.width = 1080;
        canvas.height = 1350;
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw Date
      if (displayDate) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        const dateFontSize = Math.floor(canvas.height * 0.035);
        ctx.font = `bold ${dateFontSize}px Inter, sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        const datePaddingX = canvas.width * 0.05;
        const datePaddingY = canvas.height * 0.03;
        const dateText = `DATE - ${displayDate}`;
        ctx.fillText(dateText, canvas.width - datePaddingX, datePaddingY);
        const textWidth = ctx.measureText(dateText).width;
        ctx.beginPath();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.moveTo(canvas.width - datePaddingX - textWidth, datePaddingY + dateFontSize + 15);
        ctx.lineTo(canvas.width - datePaddingX, datePaddingY + dateFontSize + 15);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Header Info in Upper Left
      if (headerInfo) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        const infoFontSize = Math.floor(canvas.height * 0.022);
        ctx.font = `bold ${infoFontSize}px Inter, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        const infoPaddingX = canvas.width * 0.05;
        const infoPaddingY = canvas.height * 0.03;
        
        const lines = headerInfo.split('\n');
        lines.forEach((line, index) => {
          ctx.fillText(line.trim(), infoPaddingX, infoPaddingY + (index * infoFontSize * 1.3));
        });
        ctx.restore();
      }

      // Draw Footer Text at Bottom Center
      if (footerText) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        const footerFontSize = Math.floor(canvas.height * 0.025);
        ctx.font = `bold ${footerFontSize}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        const footerPaddingY = canvas.height * 0.05;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        
        ctx.fillText(footerText, canvas.width / 2, canvas.height - footerPaddingY);
        ctx.restore();
      }

      // Draw products
      if (products.length >= 1 && products.length <= 6) {
        // GRID/TRIANGLE LAYOUT FOR 1-6 PRODUCTS
        const startY = canvas.height * 0.12;
        let rowHeight = canvas.height * 0.35;
        let imgSize = (canvas.width * 0.35) * imgScale;
        
        let positions = [];
        if (products.length === 1) {
          rowHeight = canvas.height * 0.5;
          imgSize = (canvas.width * 0.5) * imgScale;
          positions = [{ x: canvas.width * 0.5, y: canvas.height * 0.3 }];
        } else if (products.length === 2) {
          rowHeight = canvas.height * 0.5;
          imgSize = (canvas.width * 0.4) * imgScale;
          positions = [
            { x: canvas.width * 0.25, y: canvas.height * 0.3 },
            { x: canvas.width * 0.75, y: canvas.height * 0.3 }
          ];
        } else if (products.length === 3) {
          positions = [
            { x: canvas.width * 0.25, y: startY },             // Top Left
            { x: canvas.width * 0.75, y: startY },             // Top Right
            { x: canvas.width * 0.5, y: startY + rowHeight }   // Bottom Center
          ];
        } else if (products.length === 4) {
          positions = [
            { x: canvas.width * 0.25, y: startY },             // Row 1 Left
            { x: canvas.width * 0.75, y: startY },             // Row 1 Right
            { x: canvas.width * 0.25, y: startY + rowHeight }, // Row 2 Left
            { x: canvas.width * 0.75, y: startY + rowHeight }  // Row 2 Right
          ];
        } else if (products.length === 5) {
          rowHeight = canvas.height * 0.28;
          imgSize = (canvas.width * 0.30) * imgScale;
          positions = [
            { x: canvas.width * 0.5, y: startY },              // Row 1 Center
            { x: canvas.width * 0.25, y: startY + rowHeight }, // Row 2 Left
            { x: canvas.width * 0.75, y: startY + rowHeight }, // Row 2 Right
            { x: canvas.width * 0.25, y: startY + 2 * rowHeight }, // Row 3 Left
            { x: canvas.width * 0.75, y: startY + 2 * rowHeight }  // Row 3 Right
          ];
        } else if (products.length === 6) {
          rowHeight = canvas.height * 0.28;
          imgSize = (canvas.width * 0.28) * imgScale;
          positions = [
            { x: canvas.width * 0.25, y: startY },
            { x: canvas.width * 0.75, y: startY },
            { x: canvas.width * 0.25, y: startY + rowHeight },
            { x: canvas.width * 0.75, y: startY + rowHeight },
            { x: canvas.width * 0.25, y: startY + 2 * rowHeight },
            { x: canvas.width * 0.75, y: startY + 2 * rowHeight }
          ];
        }

        for (let i = 0; i < products.length; i++) {
          const product = products[i];
          const pos = positions[i];
          const centerX = pos.x;
          const imgY = pos.y;

          if (product.image) {
            const pImg = new Image();
            pImg.src = product.image;
            await new Promise((resolve) => { pImg.onload = resolve; });
            
            ctx.save();
            const r = imgSize * 0.08;
            const drawX = centerX - imgSize / 2;
            
            ctx.beginPath();
            ctx.roundRect(drawX, imgY, imgSize, imgSize, r);
            ctx.clip();
            
            const aspect = pImg.naturalWidth / pImg.naturalHeight;
            let dw, dh, dx, dy;
            if (aspect > 1) {
              dh = imgSize;
              dw = imgSize * aspect;
              dx = drawX - (dw - imgSize) / 2;
              dy = imgY;
            } else {
              dw = imgSize;
              dh = imgSize / aspect;
              dx = drawX;
              dy = imgY - (dh - imgSize) / 2;
            }
            ctx.drawImage(pImg, dx, dy, dw, dh);
            ctx.restore();
          }

          if (product.price || product.sku) {
            ctx.save();
            ctx.fillStyle = '#ffffff';
            const calculatedFontSize = Math.floor(rowHeight * textScale * 0.8);
            ctx.font = `bold ${calculatedFontSize}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            
            ctx.shadowBlur = 12;
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            
            const textY = imgY + imgSize + (canvas.height * 0.02);
            if (product.sku && product.price) {
              ctx.fillText(product.sku, centerX, textY);
              ctx.fillText(product.price, centerX, textY + calculatedFontSize * 1.2);
            } else if (product.sku) {
              ctx.fillText(product.sku, centerX, textY);
            } else {
              ctx.fillText(product.price, centerX, textY);
            }
            ctx.restore();
          }
        }
      } else {
        // VERTICAL LIST LAYOUT FOR 4-5 PRODUCTS
        const startY = canvas.height * 0.10; 
        const availableHeight = canvas.height * 0.88; 
        const productHeight = availableHeight / Math.max(products.length, 1);
        const imgSize = productHeight * imgScale; 
        const paddingX = canvas.width * 0.12;
        
        for (let i = 0; i < products.length; i++) {
          const product = products[i];
          const rowY = startY + (i * productHeight);
          const imgY = rowY + (productHeight - imgSize) / 2;

          if (product.image) {
            const pImg = new Image();
            pImg.src = product.image;
            await new Promise((resolve) => { pImg.onload = resolve; });
            
            ctx.save();
            const r = imgSize * 0.08;
            const x = paddingX;
            
            ctx.beginPath();
            ctx.roundRect(x, imgY, imgSize, imgSize, r);
            ctx.clip();
            
            const aspect = pImg.naturalWidth / pImg.naturalHeight;
            let drawW, drawH, drawX, drawY;
            if (aspect > 1) {
              drawH = imgSize;
              drawW = imgSize * aspect;
              drawX = x - (drawW - imgSize) / 2;
              drawY = imgY;
            } else {
              drawW = imgSize;
              drawH = imgSize / aspect;
              drawX = x;
              drawY = imgY - (drawH - imgSize) / 2;
            }
            ctx.drawImage(pImg, drawX, drawY, drawW, drawH);
            ctx.restore();
          }

          if (product.price || product.sku) {
            ctx.save();
            ctx.fillStyle = '#ffffff';
            const calculatedFontSize = Math.floor(productHeight * textScale);
            ctx.font = `bold ${calculatedFontSize}px Inter, sans-serif`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            
            const textX = paddingX + imgSize + (canvas.width * 0.04);
            ctx.shadowBlur = 12;
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            
            if (product.sku && product.price) {
              ctx.fillText(product.sku, textX, rowY + productHeight / 2 - calculatedFontSize * 0.6);
              ctx.fillText(`- ${product.price}`, textX, rowY + productHeight / 2 + calculatedFontSize * 0.6);
            } else if (product.sku) {
              ctx.fillText(product.sku, textX, rowY + productHeight / 2);
            } else {
              ctx.fillText(`- ${product.price}`, textX, rowY + productHeight / 2);
            }
            ctx.restore();
          }
        }
      }
    } catch (err) {
      console.error("Error generating image:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `price-sheet-${displayDate.replace(/\//g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      drawOnCanvas();
    }, 500);
    return () => clearTimeout(timer);
  }, [background, products, displayDate, headerInfo, footerText, imgScale, textScale]);

  return (
    <div className="min-h-screen bg-[#070709] text-gray-200 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-[#0a0a0c]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">Price Overlay Studio</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleDownload}
            disabled={!background || products.length === 0 || isGenerating}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Download Result
          </button>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
        {/* Sidebar Controls */}
        <div className="space-y-8 h-fit lg:sticky lg:top-24">
          {/* Background Selection */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">1. Template Background</h2>
              {background && <span className="text-[10px] text-green-500 font-bold flex items-center gap-1 uppercase"><Check className="w-3 h-3" /> Ready</span>}
            </div>
            <label className="group relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-2xl bg-white/5 hover:bg-blue-500/5 transition-all cursor-pointer overflow-hidden">
              {background ? (
                <div className="absolute inset-0 p-2">
                  <img src={background} alt="Background preview" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <RefreshCcw className="w-6 h-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400 p-6 text-center">
                  <Upload className="w-8 h-8 opacity-50" />
                  <span className="text-sm font-medium">Upload the background image you shared</span>
                  <span className="text-[10px] text-gray-500">Click to select file</span>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*" onChange={handleBackgroundUpload} />
            </label>
          </section>

          {/* Header Details */}
          <section className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Layout & Details</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Header Info (Left Top)</label>
                <textarea 
                  value={headerInfo}
                  onChange={(e) => setHeaderInfo(e.target.value)}
                  placeholder="e.g. 18KT GOLD..."
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Displayed Date (Right)</label>
                <input 
                  type="text" 
                  value={displayDate}
                  onChange={(e) => setDisplayDate(e.target.value)}
                  placeholder="e.g. 12/05/26"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Footer Text (Bottom Center)</label>
                <input 
                  type="text" 
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="e.g. ORDER NOW..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                />
              </div>
              <div className="space-y-2 border-t border-white/5 pt-4">
                <div className="flex justify-between text-[10px] font-bold text-gray-400">
                  <label>IMAGE SIZE</label>
                  <span>{Math.round(imgScale * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="1.5" 
                  step="0.01" 
                  value={imgScale} 
                  onChange={(e) => setImgScale(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-gray-400">
                  <label>PRICE SIZE</label>
                  <span>{Math.round(textScale * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="0.8" 
                  step="0.01" 
                  value={textScale} 
                  onChange={(e) => setTextScale(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          </section>

          {/* Product List */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">2. Products (1-6 required)</h2>
                <p className="text-[10px] text-gray-600">Select multiple images to auto-fill</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20 px-2 py-1 rounded flex items-center gap-1 font-bold uppercase transition-colors cursor-pointer">
                  <Upload className="w-3 h-3" /> Bulk Upload
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []).slice(0, 6);
                      if (files.length === 0) return;
                      
                      const readers = files.map(file => {
                        return new Promise<string>((resolve) => {
                          const reader = new FileReader();
                          reader.onload = (event) => resolve(event.target?.result as string);
                          reader.readAsDataURL(file);
                        });
                      });

                      Promise.all(readers).then(images => {
                        const count = images.length;
                        const newProducts = Array.from({ length: count }).map((_, i) => ({
                          id: Math.random().toString(36).substr(2, 9),
                          image: images[i] || null,
                          sku: products[i]?.sku || '',
                          price: products[i]?.price || '',
                        }));
                        setProducts(newProducts);
                      });
                    }}
                  />
                </label>
                <button 
                  onClick={addProduct}
                  disabled={products.length >= 6}
                  className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded flex items-center gap-1 font-bold uppercase transition-colors disabled:opacity-30"
                >
                  <Plus className="w-3 h-3" /> Add Slot
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {products.map((product, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={product.id}
                    className="group bg-white/5 border border-white/10 rounded-xl p-3 space-y-3"
                  >
                    <div className="flex items-start gap-4">
                      {/* Product Image Upload */}
                      <label className="relative flex-shrink-0 w-16 h-16 rounded-lg bg-white/10 border border-white/5 hover:border-blue-500/50 cursor-pointer overflow-hidden flex items-center justify-center group/img transition-colors">
                        {product.image ? (
                          <img src={product.image} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 opacity-30 group-hover/img:opacity-100 transition-opacity" />
                        )}
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleProductImageUpload(product.id, e)} />
                      </label>

                      {/* Product Content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">Product Slot {index + 1}</span>
                          {products.length > 3 && (
                            <button 
                              onClick={() => removeProduct(product.id)}
                              className="text-gray-500 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="space-y-1.5 flex-1">
                          <input 
                            type="text"
                            placeholder="SKU Code"
                            value={product.sku}
                            onChange={(e) => updateProduct(product.id, { sku: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 text-white placeholder:text-gray-700 font-mono tracking-tight"
                          />
                          <input 
                            type="text"
                            placeholder="Price Value"
                            value={product.price}
                            onChange={(e) => updateProduct(product.id, { price: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 text-white placeholder:text-gray-700 font-mono tracking-tight"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>

          {/* Tips */}
          {!background && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <p className="text-xs text-blue-200/70 leading-relaxed">
                Start by uploading your background image. The canvas will automatically resize to match its dimensions.
              </p>
            </div>
          )}
        </div>

        {/* Live Preview Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Live Composite Preview</h2>
            {isGenerating && (
              <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-bold animate-pulse">
                <RefreshCcw className="w-3 h-3 animate-spin" /> Rendering...
              </div>
            )}
          </div>
          
          <div className="aspect-[4/5] lg:aspect-auto min-h-[500px] w-full bg-[#0d0d0f] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative group flex items-center justify-center">
            {background ? (
              <div className="relative shadow-2xl transition-transform duration-500 group-hover:scale-[1.01] p-8 max-h-full max-w-full flex items-center justify-center">
                <canvas 
                  ref={canvasRef}
                  width={1080}
                  height={1350}
                  style={{
                    maxWidth: '100%',
                    maxHeight: 'calc(100vh - 200px)',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    backgroundColor: '#000'
                  }}
                />
                <div className="absolute inset-8 border border-white/10 pointer-events-none rounded-sm"></div>
              </div>
            ) : (
              <div className="text-center space-y-4 max-w-sm">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ImageIcon className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-white font-bold">No Image Background</h3>
                <p className="text-sm text-gray-500">
                  Please upload a background image on the left sidebar to start creating your product sheet.
                </p>
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            {/* Canvas overlay labels */}
            {background && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[10px] font-mono tracking-widest text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                {canvasRef.current?.width} × {canvasRef.current?.height}px
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
