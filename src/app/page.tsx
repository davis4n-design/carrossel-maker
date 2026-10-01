"use client";

import { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import { Download, Palette, Type, LayoutTemplate, Plus, Minus, Trash2, GripVertical, Heart, MessageCircle, PlusSquare, Send, Bookmark, BadgeCheck, AlignLeft, AlignCenter, AlignRight, AlignJustify, FolderHeart, Clock, Edit2, ChevronDown, ChevronUp, Maximize2, Minimize2, Layers, Check, Tag, ArrowRight, Sparkles } from "lucide-react";
import JSZip from "jszip";
import { Rnd } from "react-rnd";

// Definições do Design System
type TextBlock = {
  id: string;
  type: 'prefix' | 'highlight' | 'suffix';
  text: string;
  xPosition: number; // Drag horizontal (pixels)
  yPosition: number; // Drag vertical (porcentagem)
  scale: number;
  align?: 'left' | 'center' | 'right' | 'justify';
  uppercase?: boolean;
};

export type ColorPalette = {
  id: string;
  name: string;
  group: string;
  bgColor: string;
  textColor: string;
  highlightColor: string;
  secondaryTextColor: string;
};

export const DEFAULT_PALETTES: ColorPalette[] = [
  // Grupo: Bigbones
  {
    id: 'bigbones-classic',
    group: 'Assinatura Bigbones',
    name: 'Preto & Laranja',
    bgColor: '#010303',
    textColor: '#FFFFFF',
    highlightColor: '#B6280C',
    secondaryTextColor: '#B5AEAA',
  },
  {
    id: 'bigbones-inverted',
    group: 'Assinatura Bigbones',
    name: 'Invertido',
    bgColor: '#B6280C',
    textColor: '#FFFFFF',
    highlightColor: '#010303',
    secondaryTextColor: '#FFDDD4',
  },
  // Grupo: Elegância Editorial
  {
    id: 'linen-terracotta',
    group: 'Elegância Editorial',
    name: 'Linho & Terracotta',
    bgColor: '#F4EFE6',
    textColor: '#1F0B09',
    highlightColor: '#F0491D',
    secondaryTextColor: '#5A4644',
  },
  {
    id: 'dark-chocolate',
    group: 'Elegância Editorial',
    name: 'Dark Chocolate',
    bgColor: '#180A0A',
    textColor: '#FFFFFF',
    highlightColor: '#F0491D',
    secondaryTextColor: '#B39E9D',
  },
  // Grupo: Neo Brutalismo
  {
    id: 'brutal-yellow',
    group: 'Neo Brutalismo',
    name: 'Amarelo Choque',
    bgColor: '#FFE300',
    textColor: '#000000',
    highlightColor: '#FF3366',
    secondaryTextColor: '#333333',
  },
  {
    id: 'brutal-blue',
    group: 'Neo Brutalismo',
    name: 'Azul & Rosa',
    bgColor: '#0055FF',
    textColor: '#FFFFFF',
    highlightColor: '#FF3366',
    secondaryTextColor: '#E0E0E0',
  },
  // Grupo: Minimalismo Tech
  {
    id: 'tech-light',
    group: 'Minimalismo Tech',
    name: 'Prata Claro',
    bgColor: '#F8F9FA',
    textColor: '#212529',
    highlightColor: '#0D6EFD',
    secondaryTextColor: '#6C757D',
  },
  {
    id: 'tech-dark',
    group: 'Minimalismo Tech',
    name: 'Meia Noite',
    bgColor: '#0F172A',
    textColor: '#F8FAFC',
    highlightColor: '#38BDF8',
    secondaryTextColor: '#94A3B8',
  },
  // Grupo: Vibe Pastel
  {
    id: 'pastel-pink',
    group: 'Vibe Pastel',
    name: 'Rosa Algodão',
    bgColor: '#FDF2F8',
    textColor: '#831843',
    highlightColor: '#DB2777',
    secondaryTextColor: '#9D174D',
  },
  {
    id: 'pastel-mint',
    group: 'Vibe Pastel',
    name: 'Verde Menta',
    bgColor: '#ECFDF5',
    textColor: '#064E3B',
    highlightColor: '#059669',
    secondaryTextColor: '#047857',
  },
  // Grupo: Neon Cyber
  {
    id: 'cyber-matrix',
    group: 'Neon Cyber',
    name: 'Matrix',
    bgColor: '#000000',
    textColor: '#00FF41',
    highlightColor: '#008F11',
    secondaryTextColor: '#003B00',
  },
  {
    id: 'cyber-purple',
    group: 'Neon Cyber',
    name: 'Sintetizador',
    bgColor: '#090014',
    textColor: '#00FFFF',
    highlightColor: '#FF00FF',
    secondaryTextColor: '#B300FF',
  }
];

type Slide = {
  id: string;
  blocks: TextBlock[];
  palette: ColorPalette;
  isCta?: boolean;
};

type HeaderStyle = 'with_follow' | 'full_username';

type SavedPost = {
  id: string;
  name: string;
  date: string;
  slides: Slide[];
  username: string;
  avatarUrl: string;
  globalPalette: ColorPalette;
  headerStyle?: HeaderStyle;
  showHeader?: boolean;
  showFooter?: boolean;
  showVerifiedBadge?: boolean;
  showProgressBar?: boolean;
  showSlideCounter?: boolean;
  showSwipeIndicator?: boolean;
  swipeText?: string;
  showCategoryTag?: boolean;
  categoryTag?: string;
  showWatermark?: boolean;
};

type EditorStep = 'colors' | 'content' | 'elements' | 'posts';

const SLIDE_TEMPLATES = [
  { prefix: 'Por que isso é', highlight: 'IMPOR\nTANTE', suffix: 'para o seu negócio?' },
  { prefix: 'O maior', highlight: 'ERRO\nCOMUM', suffix: 'que a maioria comete' },
  { prefix: 'Descubra o', highlight: 'PASSO\nA PASSO', suffix: 'para ter resultados' },
  { prefix: 'Aplique esse', highlight: 'MÉTODO\nFÁCIL', suffix: 'e ganhe muito tempo' },
  { prefix: 'A melhor', highlight: 'ESTRA\nTÉGIA', suffix: 'para o seu perfil' },
  { prefix: 'Gostou da dica?', highlight: 'SALVE\nAGORA', suffix: 'para aplicar depois' },
  { prefix: 'Compartilhe com', highlight: 'SEUS\nAMIGOS', suffix: 'que precisam saber' },
];

export default function Home() {
  const [activeStep, setActiveStep] = useState<EditorStep>('content');
  const [globalPalette, setGlobalPalette] = useState<ColorPalette>(DEFAULT_PALETTES[2]);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [username, setUsername] = useState('davis4n');
  const DEFAULT_AVATAR = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23e5e5e5'/%3E%3Ccircle cx='50' cy='35' r='18' fill='%23a3a3a3'/%3E%3Cpath d='M20 90 a30 30 0 0 1 60 0' fill='%23a3a3a3'/%3E%3C/svg%3E";
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);
  
  const [headerStyle, setHeaderStyle] = useState<HeaderStyle>('with_follow');
  const [showHeader, setShowHeader] = useState<boolean>(true);
  const [showFooter, setShowFooter] = useState<boolean>(true);
  const [showVerifiedBadge, setShowVerifiedBadge] = useState<boolean>(true);

  // Elementos Estratégicos de Redes Sociais (Desativados por padrão)
  const [showProgressBar, setShowProgressBar] = useState<boolean>(false);
  const [showSlideCounter, setShowSlideCounter] = useState<boolean>(false);
  const [showSwipeIndicator, setShowSwipeIndicator] = useState<boolean>(false);
  const [swipeText, setSwipeText] = useState<string>('Arrasta');
  const [showCategoryTag, setShowCategoryTag] = useState<boolean>(false);
  const [categoryTag, setCategoryTag] = useState<string>('ESTRATÉGIA');
  const [showWatermark, setShowWatermark] = useState<boolean>(false);
  
  const [activeSlideId, setActiveSlideId] = useState<string>("1");
  const [collapsedSlideIds, setCollapsedSlideIds] = useState<Record<string, boolean>>({});

  const toggleSlideCollapse = (slideId: string) => {
    setCollapsedSlideIds(prev => ({
      ...prev,
      [slideId]: !prev[slideId]
    }));
  };

  const focusAndCenterSlide = (slideId: string) => {
    setActiveSlideId(slideId);
    // Expand only the selected slide and collapse all others
    setCollapsedSlideIds({ [slideId]: false });
    setTimeout(() => {
      const el = document.getElementById(`slide-frame-${slideId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }, 60);
  };
  
  const [savedPostsList, setSavedPostsList] = useState<SavedPost[]>([]);

  // Ao abrir a página, se houver postagens salvas, puxa a última como padrão
  useEffect(() => {
    try {
      const saved: SavedPost[] = JSON.parse(localStorage.getItem('savedPosts') || '[]');
      setSavedPostsList(saved);
      if (saved.length > 0 && saved[0]) {
        const latestPost = saved[0];
        if (latestPost.slides && latestPost.slides.length > 0) {
          setSlides(latestPost.slides);
          if (latestPost.username) setUsername(latestPost.username);
          if (latestPost.avatarUrl) setAvatarUrl(latestPost.avatarUrl);
          if (latestPost.globalPalette) setGlobalPalette(latestPost.globalPalette);
          if (latestPost.headerStyle) setHeaderStyle(latestPost.headerStyle);
          if (latestPost.showHeader !== undefined) setShowHeader(latestPost.showHeader);
          if (latestPost.showFooter !== undefined) setShowFooter(latestPost.showFooter);
          if (latestPost.showVerifiedBadge !== undefined) setShowVerifiedBadge(latestPost.showVerifiedBadge);
          if (latestPost.showProgressBar !== undefined) setShowProgressBar(latestPost.showProgressBar);
          if (latestPost.showSlideCounter !== undefined) setShowSlideCounter(latestPost.showSlideCounter);
          if (latestPost.showSwipeIndicator !== undefined) setShowSwipeIndicator(latestPost.showSwipeIndicator);
          if (latestPost.swipeText !== undefined) setSwipeText(latestPost.swipeText);
          if (latestPost.showCategoryTag !== undefined) setShowCategoryTag(latestPost.showCategoryTag);
          if (latestPost.categoryTag !== undefined) setCategoryTag(latestPost.categoryTag);
          if (latestPost.showWatermark !== undefined) setShowWatermark(latestPost.showWatermark);
          if (latestPost.slides[0]?.id) {
            setActiveSlideId(latestPost.slides[0].id);
            setCollapsedSlideIds({ [latestPost.slides[0].id]: false });
          }
        }
      }
    } catch (e) {
      console.error("Erro ao recuperar última postagem salva:", e);
    }
  }, []);

  useEffect(() => {
    if (activeStep === 'posts') {
      try {
        const saved = JSON.parse(localStorage.getItem('savedPosts') || '[]');
        setSavedPostsList(saved);
      } catch (e) {
        console.error("Erro ao carregar postagens", e);
      }
    }
  }, [activeStep]);

  const loadPost = (post: SavedPost) => {
    if (confirm(`Deseja carregar a postagem "${post.name || 'selecionada'}"? O design atual será substituído.`)) {
      setSlides(post.slides);
      setUsername(post.username);
      setAvatarUrl(post.avatarUrl);
      setGlobalPalette(post.globalPalette);
      if (post.headerStyle) setHeaderStyle(post.headerStyle);
      if (post.showHeader !== undefined) setShowHeader(post.showHeader);
      if (post.showFooter !== undefined) setShowFooter(post.showFooter);
      if (post.showVerifiedBadge !== undefined) setShowVerifiedBadge(post.showVerifiedBadge);
      if (post.showProgressBar !== undefined) setShowProgressBar(post.showProgressBar);
      if (post.showSlideCounter !== undefined) setShowSlideCounter(post.showSlideCounter);
      if (post.showSwipeIndicator !== undefined) setShowSwipeIndicator(post.showSwipeIndicator);
      if (post.swipeText !== undefined) setSwipeText(post.swipeText);
      if (post.showCategoryTag !== undefined) setShowCategoryTag(post.showCategoryTag);
      if (post.categoryTag !== undefined) setCategoryTag(post.categoryTag);
      if (post.showWatermark !== undefined) setShowWatermark(post.showWatermark);
      if (post.slides[0]?.id) {
        focusAndCenterSlide(post.slides[0].id);
      }
    }
  };

  const deletePost = (postId: string) => {
    if (confirm("Tem certeza que deseja excluir esta postagem salva?")) {
      try {
        const saved = JSON.parse(localStorage.getItem('savedPosts') || '[]');
        const updated = saved.filter((p: SavedPost) => p.id !== postId);
        localStorage.setItem('savedPosts', JSON.stringify(updated));
        setSavedPostsList(updated);
      } catch (e) {
        console.error("Erro ao excluir postagem", e);
      }
    }
  };

  const [slides, setSlides] = useState<Slide[]>([
    {
      id: "1",
      palette: DEFAULT_PALETTES[2],
      blocks: [
        { id: 'b1', type: 'prefix', text: 'Aprenda a criar', xPosition: 0, yPosition: 15, scale: 1 },
        { id: 'b2', type: 'highlight', text: 'CARRO\nSSEIS', xPosition: 0, yPosition: 35, scale: 1 },
        { id: 'b3', type: 'suffix', text: 'que chamam a atenção', xPosition: 0, yPosition: 80, scale: 1 },
      ]
    },
  ]);
  
  const carouselRef = useRef<HTMLDivElement>(null);

  const applyGlobalPalette = (palette: ColorPalette) => {
    setGlobalPalette(palette);
    setSlides(slides.map(slide => ({ ...slide, palette })));
  };

  const updateCustomColor = (key: keyof ColorPalette, value: string) => {
    const newPalette = { ...globalPalette, id: 'custom', name: 'Customizada', [key]: value };
    setGlobalPalette(newPalette);
    setSlides(slides.map(slide => ({ ...slide, palette: newPalette })));
  };

  const addSlide = () => {
    if (slides.length >= 10) return;
    
    // Pega um template baseado no número do slide atual para criar uma historinha genérica
    const templateIndex = (slides.length - 1) % SLIDE_TEMPLATES.length;
    const template = SLIDE_TEMPLATES[templateIndex];

    const newId = Date.now().toString();
    setSlides([
      ...slides,
      { 
        id: newId, 
        palette: globalPalette,
        blocks: [
          { id: newId + '1', type: 'prefix', text: template.prefix, xPosition: 0, yPosition: 15, scale: 1 },
          { id: newId + '2', type: 'highlight', text: template.highlight, xPosition: 0, yPosition: 35, scale: 1 },
          { id: newId + '3', type: 'suffix', text: template.suffix, xPosition: 0, yPosition: 80, scale: 1 },
        ]
      },
    ]);
    focusAndCenterSlide(newId);
  };

  const addCtaSlide = () => {
    if (slides.length >= 10) return;
    const newId = Date.now().toString();
    setSlides([
      ...slides,
      { 
        id: newId, 
        palette: globalPalette,
        isCta: true,
        blocks: [
          { id: newId + '1', type: 'prefix', text: 'Gostou do post?', xPosition: 0, yPosition: 20, scale: 1 },
          { id: newId + '2', type: 'highlight', text: 'SALVE\nAGORA', xPosition: 0, yPosition: 40, scale: 0.9 },
          { id: newId + '3', type: 'suffix', text: 'Para aplicar depois no seu perfil', xPosition: 0, yPosition: 70, scale: 1 },
        ]
      },
    ]);
    focusAndCenterSlide(newId);
  };

  const removeSlide = (id: string) => {
    if (slides.length === 1) return;
    setSlides(slides.filter((slide) => slide.id !== id));
  };

  const updateBlockText = (slideId: string, blockId: string, newText: string) => {
    setSlides(slides.map(slide => {
      if (slide.id !== slideId) return slide;
      return {
        ...slide,
        blocks: slide.blocks.map(b => b.id === blockId ? { ...b, text: newText } : b)
      };
    }));
  };

  const updateBlockAlign = (slideId: string, blockId: string, align: 'left'|'center'|'right'|'justify') => {
    setSlides(slides.map(slide => {
      if (slide.id !== slideId) return slide;
      return {
        ...slide,
        blocks: slide.blocks.map(b => b.id === blockId ? { ...b, align } : b)
      };
    }));
  };

  const updateBlockUppercase = (slideId: string, blockId: string, uppercase: boolean) => {
    setSlides(slides.map(slide => {
      if (slide.id !== slideId) return slide;
      return {
        ...slide,
        blocks: slide.blocks.map(b => b.id === blockId ? { ...b, uppercase } : b)
      };
    }));
  };

  const setAllBlocksUppercase = (uppercase: boolean) => {
    setSlides(slides.map(slide => ({
      ...slide,
      blocks: slide.blocks.map(b => ({ ...b, uppercase }))
    })));
  };

  const updateBlockYPosition = (slideId: string, blockId: string, newY: number) => {
    setSlides(slides.map(slide => {
      if (slide.id !== slideId) return slide;
      return {
        ...slide,
        blocks: slide.blocks.map(b => b.id === blockId ? { ...b, yPosition: newY } : b)
      };
    }));
  };

  const updateBlockPosition = (slideId: string, blockId: string, newX: number, newY: number) => {
    setSlides(slides.map(slide => {
      if (slide.id !== slideId) return slide;
      return {
        ...slide,
        blocks: slide.blocks.map(b => b.id === blockId ? { ...b, xPosition: newX, yPosition: newY } : b)
      };
    }));
  };

  const updateBlockScale = (slideId: string, blockId: string, newScale: number) => {
    setSlides(slides.map(slide => {
      if (slide.id !== slideId) return slide;
      return {
        ...slide,
        blocks: slide.blocks.map(b => b.id === blockId ? { ...b, scale: newScale } : b)
      };
    }));
  };

  const savePostLocally = (customName?: string) => {
    try {
      const saved = JSON.parse(localStorage.getItem('savedPosts') || '[]');
      const firstHighlight = slides[0]?.blocks.find(b => b.type === 'highlight')?.text.replace(/\n/g, ' ') || `Carrossel ${saved.length + 1}`;
      const newPost: SavedPost = {
        id: Date.now().toString(),
        name: customName || firstHighlight,
        date: new Date().toISOString(),
        slides: JSON.parse(JSON.stringify(slides)), // deep clone to preserve exact state
        username,
        avatarUrl,
        globalPalette: { ...globalPalette },
        headerStyle,
        showHeader,
        showFooter,
        showVerifiedBadge,
        showProgressBar,
        showSlideCounter,
        showSwipeIndicator,
        swipeText,
        showCategoryTag,
        categoryTag,
        showWatermark
      };
      // Keep up to 15 posts to avoid exceeding browser localStorage quotas
      const updated = [newPost, ...saved.slice(0, 14)];
      localStorage.setItem('savedPosts', JSON.stringify(updated));
      setSavedPostsList(updated);
      return true;
    } catch (e) {
      console.warn("Aviso ao salvar postagem localmente (possivelmente limite de armazenamento):", e);
      return false;
    }
  };

  const renamePost = (postId: string, newName: string) => {
    try {
      const saved = JSON.parse(localStorage.getItem('savedPosts') || '[]');
      const updated = saved.map((p: SavedPost) => p.id === postId ? { ...p, name: newName } : p);
      localStorage.setItem('savedPosts', JSON.stringify(updated));
      setSavedPostsList(updated);
    } catch (e) {
      console.error("Erro ao renomear postagem", e);
    }
  };

  const exportCarousel = async () => {
    if (!carouselRef.current || slides.length === 0) return;
    const prevZoom = canvasZoom;
    try {
      // Normalizar zoom para 1 e ativar modo exportação (borda quadrada e sem guias de editor)
      setCanvasZoom(1);
      setIsExporting(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const zip = new JSZip();

      // Exportar cada slide individualmente
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const slideEl = document.getElementById(`slide-frame-${slide.id}`);
        if (!slideEl) continue;

        const dataUrl = await toPng(slideEl, { 
          cacheBust: false,
          pixelRatio: 2,
          backgroundColor: slide.palette.bgColor,
          filter: (node) => {
            if (node instanceof HTMLElement && node.classList?.contains('export-ignore')) {
              return false;
            }
            return true;
          }
        });

        if (slides.length === 1) {
          // Se for só 1 slide, faz download direto em PNG
          const link = document.createElement("a");
          link.download = `slide-01.png`;
          link.href = dataUrl;
          link.click();
        } else {
          // Adiciona cada imagem individual ao arquivo ZIP
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
          const fileName = `slide-${String(i + 1).padStart(2, '0')}.png`;
          zip.file(fileName, base64Data, { base64: true });
        }
      }

      // Se houver múltiplos slides, baixa o arquivo ZIP compactado com todos
      if (slides.length > 1) {
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.download = `carrossel-slides-${Date.now()}.zip`;
        link.href = URL.createObjectURL(zipBlob);
        link.click();
      }
      
      setIsExporting(false);
      setCanvasZoom(prevZoom);

      savePostLocally();
      alert(`Design exportado com sucesso! ${slides.length > 1 ? `Todas as ${slides.length} telas foram salvas como imagens individuais (.png) no arquivo .ZIP!` : 'O slide foi salvo como imagem individual (.png) com bordas retas!'}`);
    } catch (err: any) {
      setIsExporting(false);
      setCanvasZoom(prevZoom);
      console.error("Erro crítico ao exportar imagens:", err);
      alert("Erro ao exportar carrossel: " + (err?.message || "Ocorreu um erro ao gerar as imagens individuais."));
    }
  };

  // Renderização da Sidebar baseada no passo ativo
  const renderSidebarContent = () => {
    switch (activeStep) {
      case 'colors': {
        const groupedPalettes = DEFAULT_PALETTES.reduce((acc, p) => {
          if (!acc[p.group]) acc[p.group] = [];
          acc[p.group].push(p);
          return acc;
        }, {} as Record<string, ColorPalette[]>);

        return (
          <div className="w-64 bg-white border-r border-neutral-200 flex flex-col p-6 shrink-0 gap-2 overflow-y-auto z-10 custom-scrollbar">
            <h2 className="font-bold text-sm text-neutral-800 uppercase tracking-wider mb-4">Paletas (Cores)</h2>
            <div className="flex flex-col gap-6">
              {Object.entries(groupedPalettes).map(([groupName, palettes]) => (
                <div key={groupName}>
                  <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">{groupName}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {palettes.map(p => (
                      <button
                        key={p.id}
                        title={p.name}
                        onClick={() => applyGlobalPalette(p)}
                        className={`p-1.5 rounded-lg border transition-all ${globalPalette.id === p.id ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-sm' : 'border-neutral-200 hover:border-neutral-300 bg-white'}`}
                      >
                        <div className="flex rounded-md overflow-hidden h-8 w-full border border-black/10">
                          <div style={{ backgroundColor: p.bgColor }} className="flex-[2]" />
                          <div style={{ backgroundColor: p.textColor }} className="flex-1" />
                          <div style={{ backgroundColor: p.highlightColor }} className="flex-1" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Color Picker */}
            <div className="mt-2 border-t border-neutral-200 pt-6">
              <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                🎨 Personalizar
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 group">
                  <span className="text-[10px] font-semibold text-neutral-600">Fundo</span>
                  <div className="flex items-center gap-2 border border-neutral-200 p-1.5 rounded-xl bg-white focus-within:border-blue-500 transition-colors shadow-sm">
                    <label className="relative w-6 h-6 rounded-full overflow-hidden border border-black/10 shrink-0 cursor-pointer">
                      <div className="absolute inset-0" style={{ backgroundColor: globalPalette.bgColor }} />
                      <input type="color" value={globalPalette.bgColor} onChange={e => updateCustomColor('bgColor', e.target.value)} className="absolute -inset-2 opacity-0 w-10 h-10 cursor-pointer" />
                    </label>
                    <input 
                      type="text" 
                      value={globalPalette.bgColor} 
                      onChange={e => updateCustomColor('bgColor', e.target.value)} 
                      placeholder="#000000"
                      className="w-full text-[11px] text-neutral-800 uppercase font-mono font-bold bg-transparent border-none focus:outline-none" 
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 group">
                  <span className="text-[10px] font-semibold text-neutral-600">Texto</span>
                  <div className="flex items-center gap-2 border border-neutral-200 p-1.5 rounded-xl bg-white focus-within:border-blue-500 transition-colors shadow-sm">
                    <label className="relative w-6 h-6 rounded-full overflow-hidden border border-black/10 shrink-0 cursor-pointer">
                      <div className="absolute inset-0" style={{ backgroundColor: globalPalette.textColor }} />
                      <input type="color" value={globalPalette.textColor} onChange={e => updateCustomColor('textColor', e.target.value)} className="absolute -inset-2 opacity-0 w-10 h-10 cursor-pointer" />
                    </label>
                    <input 
                      type="text" 
                      value={globalPalette.textColor} 
                      onChange={e => updateCustomColor('textColor', e.target.value)} 
                      placeholder="#000000"
                      className="w-full text-[11px] text-neutral-800 uppercase font-mono font-bold bg-transparent border-none focus:outline-none" 
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 group">
                  <span className="text-[10px] font-semibold text-neutral-600">Destaque</span>
                  <div className="flex items-center gap-2 border border-neutral-200 p-1.5 rounded-xl bg-white focus-within:border-blue-500 transition-colors shadow-sm">
                    <label className="relative w-6 h-6 rounded-full overflow-hidden border border-black/10 shrink-0 cursor-pointer">
                      <div className="absolute inset-0" style={{ backgroundColor: globalPalette.highlightColor }} />
                      <input type="color" value={globalPalette.highlightColor} onChange={e => updateCustomColor('highlightColor', e.target.value)} className="absolute -inset-2 opacity-0 w-10 h-10 cursor-pointer" />
                    </label>
                    <input 
                      type="text" 
                      value={globalPalette.highlightColor} 
                      onChange={e => updateCustomColor('highlightColor', e.target.value)} 
                      placeholder="#000000"
                      className="w-full text-[11px] text-neutral-800 uppercase font-mono font-bold bg-transparent border-none focus:outline-none" 
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 group">
                  <span className="text-[10px] font-semibold text-neutral-600">Secundária</span>
                  <div className="flex items-center gap-2 border border-neutral-200 p-1.5 rounded-xl bg-white focus-within:border-blue-500 transition-colors shadow-sm">
                    <label className="relative w-6 h-6 rounded-full overflow-hidden border border-black/10 shrink-0 cursor-pointer">
                      <div className="absolute inset-0" style={{ backgroundColor: globalPalette.secondaryTextColor }} />
                      <input type="color" value={globalPalette.secondaryTextColor} onChange={e => updateCustomColor('secondaryTextColor', e.target.value)} className="absolute -inset-2 opacity-0 w-10 h-10 cursor-pointer" />
                    </label>
                    <input 
                      type="text" 
                      value={globalPalette.secondaryTextColor} 
                      onChange={e => updateCustomColor('secondaryTextColor', e.target.value)} 
                      placeholder="#000000"
                      className="w-full text-[11px] text-neutral-800 uppercase font-mono font-bold bg-transparent border-none focus:outline-none" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      case 'content':
        return (
          <div className="w-80 bg-white border-r border-neutral-200 flex flex-col shrink-0 z-10 h-full">
            <div className="p-4 border-b border-neutral-100 flex-shrink-0 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-sm text-neutral-800 uppercase tracking-wider">Conteúdo</h2>
                  <p className="text-[11px] text-neutral-400">Editando Slide {slides.findIndex(s => s.id === activeSlideId) + 1} de {slides.length}</p>
                </div>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                  {slides.length} slides
                </span>
              </div>

              {/* Controles Globais de Caixa Alta */}
              <div className="flex items-center justify-between pt-1.5 border-t border-neutral-100">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Caixa Alta:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAllBlocksUppercase(true)}
                    className="px-2 py-1 text-[10px] font-bold rounded-md border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 flex items-center gap-1 transition-all shadow-xs"
                    title="Colocar todos os textos do carrossel em caixa alta (MAIÚSCULAS)"
                  >
                    <span className="font-black text-blue-600">AA</span>
                    <span>Maiúsculas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllBlocksUppercase(false)}
                    className="px-2 py-1 text-[10px] font-bold rounded-md border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-700 flex items-center gap-1 transition-all shadow-xs"
                    title="Colocar todos os textos do carrossel em caixa normal"
                  >
                    <span className="font-normal text-neutral-500">Aa</span>
                    <span>Normal</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar pb-40">
              {slides.map((slide, sIdx) => {
                // Se não foi explicitamente alternado, minimiza todos os slides que não forem o ativo!
                const isCollapsed = collapsedSlideIds[slide.id] !== undefined ? collapsedSlideIds[slide.id] : activeSlideId !== slide.id;
                const isActive = activeSlideId === slide.id;
                const mainText = slide.blocks.find(b => b.type === 'highlight')?.text.replace(/\n/g, ' ') || 'Texto do slide';

                return (
                  <div 
                    key={slide.id} 
                    className={`border rounded-xl transition-all overflow-hidden ${
                      isActive 
                        ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white shadow-sm' 
                        : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300'
                    }`}
                  >
                    {/* Cabeçalho do Card com botão de Minimizar/Maximizar */}
                    <div 
                      onClick={() => {
                        if (isCollapsed) {
                          focusAndCenterSlide(slide.id);
                        } else {
                          toggleSlideCollapse(slide.id);
                        }
                      }}
                      className="p-3 flex items-center justify-between cursor-pointer select-none bg-neutral-100/50 hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-xs font-black uppercase tracking-wider ${isActive ? 'text-blue-600' : 'text-neutral-700'}`}>
                          Slide {sIdx + 1}
                        </span>
                        {slide.isCta && (
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">CTA</span>
                        )}
                        {isCollapsed && (
                          <span className="text-[11px] text-neutral-400 truncate max-w-[130px]">
                            "{mainText}"
                          </span>
                        )}
                      </div>
                      
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isCollapsed) {
                            focusAndCenterSlide(slide.id);
                          } else {
                            toggleSlideCollapse(slide.id);
                          }
                        }}
                        title={isCollapsed ? "Maximizar e centralizar slide" : "Minimizar slide"}
                        className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'text-neutral-400 hover:bg-neutral-200'}`}
                      >
                        {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Conteúdo Expansível (Controles de Texto do Slide) */}
                    {!isCollapsed && (
                      <div className="p-4 pt-3 flex flex-col gap-3.5 border-t border-neutral-200 bg-white">
                        {slide.blocks.map(block => {
                          const isUpper = block.uppercase !== undefined ? block.uppercase : (block.type === 'highlight');

                          return (
                            <div key={block.id} className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-neutral-50/70 border border-neutral-200/70">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-neutral-600 uppercase tracking-wide">
                                  {block.type === 'prefix' ? 'Contexto (Prefix)' : block.type === 'highlight' ? 'Destaque (Headline)' : 'Conclusão (Suffix)'}
                                </label>
                                <span className="text-[10px] font-bold text-blue-600">
                                  {Math.round((block.scale || 1) * 100)}%
                                </span>
                              </div>

                              <div className="flex gap-2 items-center w-full">
                                <span className="text-[9px] text-neutral-400 font-medium">Tamanho:</span>
                                <input 
                                  type="range" 
                                  min="0.5" 
                                  max="2" 
                                  step="0.05"
                                  value={block.scale || 1}
                                  onChange={(e) => updateBlockScale(slide.id, block.id, parseFloat(e.target.value))}
                                  className="flex-1 h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                                />
                              </div>

                              <div className="flex gap-1.5 w-full justify-between mt-0.5 items-center">
                                <div className="flex gap-1 flex-1">
                                  <button onClick={() => updateBlockAlign(slide.id, block.id, 'left')} title="Alinhar à Esquerda" className={`flex-1 flex justify-center p-1 rounded ${block.align === 'left' || !block.align ? 'bg-blue-100 text-blue-600' : 'text-neutral-400 hover:bg-neutral-200'}`}><AlignLeft className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => updateBlockAlign(slide.id, block.id, 'center')} title="Centralizar" className={`flex-1 flex justify-center p-1 rounded ${block.align === 'center' ? 'bg-blue-100 text-blue-600' : 'text-neutral-400 hover:bg-neutral-200'}`}><AlignCenter className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => updateBlockAlign(slide.id, block.id, 'right')} title="Alinhar à Direita" className={`flex-1 flex justify-center p-1 rounded ${block.align === 'right' ? 'bg-blue-100 text-blue-600' : 'text-neutral-400 hover:bg-neutral-200'}`}><AlignRight className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => updateBlockAlign(slide.id, block.id, 'justify')} title="Justificar" className={`flex-1 flex justify-center p-1 rounded ${block.align === 'justify' ? 'bg-blue-100 text-blue-600' : 'text-neutral-400 hover:bg-neutral-200'}`}><AlignJustify className="w-3.5 h-3.5" /></button>
                                </div>

                                {/* Botão Caixa Alta individual do bloco */}
                                <button
                                  type="button"
                                  onClick={() => updateBlockUppercase(slide.id, block.id, !isUpper)}
                                  title={isUpper ? "Desativar Caixa Alta" : "Ativar Caixa Alta"}
                                  className={`w-7 h-6 flex items-center justify-center rounded text-[11px] font-black border transition-all shrink-0 ${
                                    isUpper 
                                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs' 
                                      : 'bg-white border-neutral-300 text-neutral-500 hover:border-neutral-400 hover:text-neutral-700'
                                  }`}
                                >
                                  AA
                                </button>
                              </div>

                              {block.type === 'highlight' ? (
                                <textarea
                                  value={block.text}
                                  onChange={(e) => updateBlockText(slide.id, block.id, e.target.value)}
                                  onFocus={() => {
                                    setFocusedBlockId(block.id);
                                    focusAndCenterSlide(slide.id);
                                  }}
                                  onBlur={() => setFocusedBlockId(null)}
                                  rows={2}
                                  className={`w-full text-xs p-2 rounded-md border border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none bg-white font-bold ${isUpper ? 'uppercase' : ''}`}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={block.text}
                                  onChange={(e) => updateBlockText(slide.id, block.id, e.target.value)}
                                  onFocus={() => {
                                    setFocusedBlockId(block.id);
                                    focusAndCenterSlide(slide.id);
                                  }}
                                  onBlur={() => setFocusedBlockId(null)}
                                  className={`w-full text-xs p-2 rounded-md border border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white font-medium ${isUpper ? 'uppercase' : ''}`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'elements':
        return (
          <div className="w-80 bg-white border-r border-neutral-200 flex flex-col shrink-0 z-10 h-full overflow-y-auto custom-scrollbar p-6 gap-6 pb-24">
            <div>
              <h2 className="font-bold text-sm text-neutral-800 uppercase tracking-wider mb-1">Elementos da Página</h2>
              <p className="text-[11px] text-neutral-500">Configure o cabeçalho superior e o rodapé do carrossel.</p>
            </div>

            {/* SEÇÃO CABEÇALHO (PARTE SUPERIOR) */}
            <div className="flex flex-col gap-3 border border-neutral-200 rounded-xl p-4 bg-neutral-50/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-neutral-800 uppercase tracking-wide">Parte Superior (Header)</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <span className="text-[10px] font-semibold text-neutral-500">Exibir</span>
                  <input 
                    type="checkbox" 
                    checked={showHeader} 
                    onChange={e => setShowHeader(e.target.checked)} 
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Estilo do Cabeçalho</span>
                
                {/* Opção 1: Padrão com "Seguir" */}
                <button
                  onClick={() => setHeaderStyle('with_follow')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                    headerStyle === 'with_follow'
                      ? 'border-blue-500 bg-white ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800">1. Padrão com "Seguir"</span>
                    {headerStyle === 'with_follow' && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-[10px] text-neutral-500 leading-relaxed">
                    Formato clássico do Instagram com o botão "• Seguir" ao lado do nome (pode abreviar nomes muito longos).
                  </p>
                </button>

                {/* Opção 2: Nome Completo (Sem abreviação) */}
                <button
                  onClick={() => setHeaderStyle('full_username')}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1.5 ${
                    headerStyle === 'full_username'
                      ? 'border-blue-500 bg-white ring-2 ring-blue-500/20 shadow-sm'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800">2. @ Completo (Sem abreviar)</span>
                    {headerStyle === 'full_username' && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-[10px] text-neutral-500 leading-relaxed">
                    Remove a palavra "Seguir" para dar espaço livre total e nunca abreviar ou cortar seu @.
                  </p>
                </button>
              </div>

              {/* Opção de Selo de Verificado */}
              <div className="mt-2 pt-3 border-t border-neutral-200 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-neutral-700 flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500" />
                  Selo de Verificado
                </span>
                <input 
                  type="checkbox" 
                  checked={showVerifiedBadge} 
                  onChange={e => setShowVerifiedBadge(e.target.checked)} 
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
            </div>

            {/* SEÇÃO IDENTIDADE (@ E FOTO) */}
            <div className="flex flex-col gap-3 border border-neutral-200 rounded-xl p-4 bg-neutral-50/60">
              <span className="text-xs font-black text-neutral-800 uppercase tracking-wide">Identidade do Perfil</span>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Nome de Usuário (@)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-neutral-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white font-medium"
                  placeholder="Seu @ no instagram"
                />
              </div>

              <div className="flex flex-col gap-1.5 mt-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Foto de Perfil</label>
                <div className="flex items-center gap-3">
                  <img src={avatarUrl} alt="Avatar Preview" className="w-11 h-11 rounded-full border border-neutral-200 object-cover shrink-0 shadow-sm" />
                  <label className="flex-1 text-center text-xs font-bold bg-white hover:bg-neutral-100 text-neutral-700 py-2.5 px-3 rounded-lg cursor-pointer transition-colors border border-neutral-300 shadow-sm">
                    Fazer Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setAvatarUrl(event.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* SEÇÃO ELEMENTOS ESTRATÉGICOS (REDE SOCIAL / RETENÇÃO) */}
            <div className="flex flex-col gap-4 border border-neutral-200 rounded-xl p-4 bg-neutral-50/60">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-black text-neutral-800 uppercase tracking-wide">Recursos de Retenção</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Elementos visuais para aumentar engajamento.</p>
                </div>
              </div>

              {/* Ações Rápidas: Ativar Todos / Desativar Todos */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowProgressBar(true);
                    setShowSlideCounter(true);
                    setShowSwipeIndicator(true);
                    setShowCategoryTag(true);
                    setShowWatermark(true);
                  }}
                  className="flex-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-200 transition-colors shadow-sm"
                >
                  ✓ Ativar Todos
                </button>
                <button
                  onClick={() => {
                    setShowProgressBar(false);
                    setShowSlideCounter(false);
                    setShowSwipeIndicator(false);
                    setShowCategoryTag(false);
                    setShowWatermark(false);
                  }}
                  className="flex-1 py-1.5 px-2 bg-white hover:bg-neutral-100 text-neutral-600 text-[10px] font-bold rounded-lg border border-neutral-200 transition-colors shadow-sm"
                >
                  ✕ Desativar Todos
                </button>
              </div>

              <div className="flex flex-col gap-3 pt-2 border-t border-neutral-200">
                {/* 1. Barra de Progresso */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-neutral-800 block">Barra de Progresso</span>
                    <span className="text-[10px] text-neutral-500">Linha fina no topo que preenche a cada slide</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={showProgressBar} 
                    onChange={e => setShowProgressBar(e.target.checked)} 
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0 ml-2"
                  />
                </div>

                {/* 2. Numeração Editorial (01 / 05) */}
                <div className="flex items-center justify-between border-t border-neutral-200/60 pt-2.5">
                  <div>
                    <span className="text-xs font-bold text-neutral-800 block">Numeração de Slides</span>
                    <span className="text-[10px] text-neutral-500">Contador de páginas (ex: 01 / {slides.length})</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={showSlideCounter} 
                    onChange={e => setShowSlideCounter(e.target.checked)} 
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0 ml-2"
                  />
                </div>

                {/* 3. Indicador de Deslize (Swipe) */}
                <div className="flex flex-col gap-2 border-t border-neutral-200/60 pt-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-neutral-800 block">Indicador de Deslize</span>
                      <span className="text-[10px] text-neutral-500">Pílula com "Arrasta ➔" para próximo frame</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={showSwipeIndicator} 
                      onChange={e => setShowSwipeIndicator(e.target.checked)} 
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0 ml-2"
                    />
                  </div>
                  {showSwipeIndicator && (
                    <input 
                      type="text" 
                      value={swipeText} 
                      onChange={e => setSwipeText(e.target.value)} 
                      placeholder="Texto do botão (ex: Arrasta, Deslize)"
                      className="w-full text-xs p-2 rounded-lg border border-neutral-300 focus:border-blue-500 bg-white font-medium"
                    />
                  )}
                </div>

                {/* 4. Tag / Pílula de Categoria */}
                <div className="flex flex-col gap-2 border-t border-neutral-200/60 pt-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-neutral-800 block">Tag de Assunto (Capa)</span>
                      <span className="text-[10px] text-neutral-500">Pílula editorial no primeiro slide</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={showCategoryTag} 
                      onChange={e => setShowCategoryTag(e.target.checked)} 
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0 ml-2"
                    />
                  </div>
                  {showCategoryTag && (
                    <input 
                      type="text" 
                      value={categoryTag} 
                      onChange={e => setCategoryTag(e.target.value)} 
                      placeholder="Tag (ex: ESTRATÉGIA, GUIA, DICA)"
                      className="w-full text-xs p-2 rounded-lg border border-neutral-300 focus:border-blue-500 bg-white font-medium uppercase"
                    />
                  )}
                </div>

                {/* 5. Assinatura / Marca d'água */}
                <div className="flex items-center justify-between border-t border-neutral-200/60 pt-2.5">
                  <div>
                    <span className="text-xs font-bold text-neutral-800 block">Marca d'água (@ Interno)</span>
                    <span className="text-[10px] text-neutral-500">Foto e @ discretos nos slides 2 em diante</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={showWatermark} 
                    onChange={e => setShowWatermark(e.target.checked)} 
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0 ml-2"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO RODAPÉ (PARTE INFERIOR) */}
            <div className="flex flex-col gap-3 border border-neutral-200 rounded-xl p-4 bg-neutral-50/60">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-neutral-800 uppercase tracking-wide">Parte Inferior (Rodapé)</span>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Ícones de curtir, comentar e salvar.</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showFooter} 
                    onChange={e => setShowFooter(e.target.checked)} 
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        );
      case 'posts':
        return (
          <div className="w-80 bg-white border-r border-neutral-200 h-full flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            <div className="p-6 border-b border-neutral-100 flex-shrink-0">
              <h2 className="font-bold text-lg text-neutral-800 tracking-tight">Suas Postagens</h2>
              <p className="text-xs text-neutral-500 mt-1">Carrosséis salvos automaticamente ao exportar.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
              {savedPostsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center mt-10 opacity-50">
                  <FolderHeart className="w-12 h-12 text-neutral-300 mb-2" />
                  <p className="text-sm font-medium">Nenhuma postagem salva</p>
                  <p className="text-xs">Exporte um design para salvá-lo automaticamente aqui.</p>
                </div>
              ) : (
                savedPostsList.map((post) => (
                  <div key={post.id} className="border border-neutral-200 rounded-xl p-3 flex flex-col gap-2 hover:border-blue-300 transition-colors bg-neutral-50 shadow-sm">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex items-center gap-1 group/rename">
                          <input 
                            type="text" 
                            value={post.name || `Carrossel`} 
                            onChange={(e) => renamePost(post.id, e.target.value)}
                            className="text-xs font-bold text-neutral-800 bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-blue-500 focus:bg-white rounded px-1 -ml-1 focus:outline-none w-full truncate"
                            title="Clique para renomear este modelo"
                          />
                          <Edit2 className="w-3 h-3 text-neutral-400 opacity-0 group-hover/rename:opacity-100 transition-opacity shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-500 mt-1">
                          <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">@{post.username}</span>
                          <span>•</span>
                          <span>{post.slides.length} slides</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => deletePost(post.id)} 
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors shrink-0"
                        title="Excluir postagem salva"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    
                    {/* Mini preview visual */}
                    <div className="h-8 w-full rounded-md flex overflow-hidden border border-neutral-200" style={{ backgroundColor: post.globalPalette.bgColor }}>
                      <div className="h-full w-1/3" style={{ backgroundColor: post.globalPalette.highlightColor, opacity: 0.8 }}></div>
                      <div className="h-full w-1/3" style={{ backgroundColor: post.globalPalette.textColor, opacity: 0.3 }}></div>
                      <div className="h-full w-1/3 flex items-center justify-center text-[9px] font-mono text-neutral-500">
                        {new Date(post.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </div>
                    </div>

                    <button 
                      onClick={() => loadPost(post)} 
                      className="mt-1 w-full text-xs font-bold bg-neutral-900 hover:bg-black text-white py-2 rounded-lg transition-all shadow-sm active:scale-[0.98]"
                    >
                      Carregar Design
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-neutral-100 font-sans text-neutral-900 overflow-hidden">
      
      {/* SIDEBAR - NAVEGAÇÃO PRINCIPAL */}
      <aside className="w-20 bg-white border-r border-neutral-200 flex flex-col items-center py-6 gap-2 z-20 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <button 
          onClick={() => setActiveStep('colors')}
          className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${activeStep === 'colors' ? 'bg-neutral-100 text-blue-600' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'}`}
        >
          <Palette className="w-6 h-6" />
          <span className="text-[10px] font-semibold">1. Cores</span>
        </button>
        <button 
          onClick={() => setActiveStep('content')}
          className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${activeStep === 'content' ? 'bg-neutral-100 text-blue-600' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'}`}
        >
          <Type className="w-6 h-6" />
          <span className="text-[10px] font-semibold">2. Textos</span>
        </button>
        <button 
          onClick={() => setActiveStep('elements')}
          className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${activeStep === 'elements' ? 'bg-neutral-100 text-blue-600' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'}`}
        >
          <Layers className="w-6 h-6" />
          <span className="text-[10px] font-semibold">3. Elementos</span>
        </button>
        <button 
          onClick={() => setActiveStep('posts')}
          className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all mt-auto ${activeStep === 'posts' ? 'bg-neutral-100 text-blue-600' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'}`}
        >
          <FolderHeart className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Postagens</span>
        </button>
      </aside>

      {/* PAINEL SECUNDÁRIO (DINÂMICO) */}
      {renderSidebarContent()}

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-neutral-900">
        
        {/* TOPBAR */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
          <div className="flex flex-col">
            <h1 className="font-bold text-neutral-800 tracking-tight">Design Engine</h1>
            <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest">Editorial Social</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">{slides.length}/10 Slides</span>
            <button 
              onClick={exportCarousel}
              className="bg-black hover:bg-neutral-800 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              Exportar Design
            </button>
          </div>
        </header>

        {/* WORKSPACE (CANVAS) */}
        <div className="flex-1 overflow-auto p-12 custom-scrollbar flex flex-col relative">
          
          {/* ZOOM CONTROLS */}
          <div className="absolute bottom-8 right-8 bg-neutral-800 text-white shadow-xl rounded-full border border-neutral-700 flex items-center p-1.5 z-50">
            <button onClick={() => setCanvasZoom(z => Math.max(0.3, z - 0.1))} className="p-2 hover:bg-neutral-700 rounded-full transition-colors"><Minus className="w-4 h-4" /></button>
            <span className="text-xs font-semibold w-14 text-center">{Math.round(canvasZoom * 100)}%</span>
            <button onClick={() => setCanvasZoom(z => Math.min(2, z + 0.1))} className="p-2 hover:bg-neutral-700 rounded-full transition-colors"><Plus className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 min-h-max flex items-center justify-center pb-12 pt-12">
            
            <div style={{ transform: `scale(${canvasZoom})`, transformOrigin: 'center center', transition: isExporting ? 'none' : 'transform 0.2s ease-out' }} className="flex items-center">
              {/* CONTAINER CONTÍNUO DOS SLIDES */}
              <div className={`flex items-stretch relative ${isExporting ? 'gap-0' : 'gap-4'}`} ref={carouselRef}>
                
                {slides.map((slide, index) => (
                <div 
                  key={slide.id}
                  id={`slide-frame-${slide.id}`}
                  onClick={() => focusAndCenterSlide(slide.id)}
                  className={`relative group flex-shrink-0 flex flex-col justify-center overflow-hidden transition-all ${
                    isExporting 
                      ? 'rounded-none shadow-none ring-0' 
                      : `rounded-[32px] shadow-2xl cursor-pointer ${activeSlideId === slide.id ? 'ring-4 ring-blue-500 ring-offset-4 ring-offset-neutral-900' : 'hover:ring-2 hover:ring-white/30'}`
                  }`}
                  // 400x500 preserva o ratio de 4:5 (ex: 1080x1350)
                  style={{ width: "400px", height: "500px", backgroundColor: slide.palette.bgColor }}
                >
                  
                  {/* GUIAS DE ALINHAMENTO (Visíveis no hover ou foco) */}
                  <div className="export-ignore absolute inset-0 pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {/* Centro Vertical */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] border-l border-dashed -translate-x-1/2" style={{ borderColor: slide.palette.textColor, opacity: 0.25 }}></div>
                    {/* Centro Horizontal */}
                    <div className="absolute top-1/2 left-0 right-0 h-[1px] border-t border-dashed -translate-y-1/2" style={{ borderColor: slide.palette.textColor, opacity: 0.25 }}></div>
                    {/* Safe Zone (Padding 10 = 40px) */}
                    <div className="absolute inset-10 border border-dashed rounded-none" style={{ borderColor: slide.palette.textColor, opacity: 0.2 }}></div>
                  </div>
                  
                  {/* Badge de número do slide */}
                  <div className="export-ignore absolute -top-10 left-0 text-neutral-500 text-xs font-bold px-2 py-1 bg-white shadow-sm rounded-md border border-neutral-200 z-50">
                    Frame {index + 1}
                  </div>

                  {slides.length > 1 && (
                    <button 
                      onClick={() => removeSlide(slide.id)}
                      className="export-ignore absolute top-4 right-4 bg-white/90 text-red-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 shadow-sm z-50 border border-neutral-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* FRAME DE CONTEÚDO EDITORIAL (Limite restrito) */}
                  <div className="relative w-full h-full flex flex-col justify-center border border-dashed border-transparent group-hover:border-black/10 transition-colors">
                    
                    {/* BARRA DE PROGRESSO SUPERIOR (Linha de Leitura) */}
                    {showProgressBar && (
                      <div className="absolute top-0 left-0 w-full h-[3px] z-30 overflow-hidden flex" style={{ backgroundColor: `${slide.palette.textColor}18` }}>
                        <div 
                          className="h-full transition-all duration-300"
                          style={{ 
                            width: `${((index + 1) / slides.length) * 100}%`, 
                            backgroundColor: slide.palette.highlightColor 
                          }} 
                        />
                      </div>
                    )}

                    {/* INSTAGRAM HEADER MOCKUP (Apenas no primeiro slide) */}
                    {index === 0 && showHeader && (
                      <div className="absolute top-10 left-0 w-full px-10 flex items-center justify-between z-20">
                        <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
                          <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 shrink-0">
                            <div className="w-full h-full rounded-full border-2 border-transparent overflow-hidden bg-white" style={{ borderColor: slide.palette.bgColor }}>
                               <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" crossOrigin="anonymous" />
                            </div>
                          </div>
                          
                          {headerStyle === 'with_follow' ? (
                            /* Versão 1: Padrão clássico com "Seguir" */
                            <div className="flex items-center gap-1 min-w-0">
                              <span style={{ color: slide.palette.textColor }} className="font-bold text-[13px] truncate">
                                {username}
                              </span>
                              {showVerifiedBadge && (
                                <BadgeCheck className="w-[14px] h-[14px] text-blue-500 fill-blue-500 shrink-0" style={{ color: slide.palette.bgColor }} />
                              )}
                              <span className="text-neutral-400 mx-1 text-xs shrink-0">•</span>
                              <span style={{ color: slide.palette.highlightColor }} className="font-bold text-[13px] shrink-0">Seguir</span>
                            </div>
                          ) : (
                            /* Versão 2: @ Completo sem abreviação, sem o botão "Seguir" */
                            <div className="flex items-center gap-1 min-w-0 flex-1">
                              <span style={{ color: slide.palette.textColor }} className="font-bold text-[13px] whitespace-nowrap overflow-visible">
                                {username}
                              </span>
                              {showVerifiedBadge && (
                                <BadgeCheck className="w-[14px] h-[14px] text-blue-500 fill-blue-500 shrink-0" style={{ color: slide.palette.bgColor }} />
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4 shrink-0" style={{ color: slide.palette.textColor }}>
                          <Heart className="w-[22px] h-[22px]" />
                          <MessageCircle className="w-[22px] h-[22px]" />
                          <PlusSquare className="w-[22px] h-[22px]" />
                        </div>
                      </div>
                    )}

                    {/* TAG DE ASSUNTO / CATEGORIA (Slide 1) */}
                    {index === 0 && showCategoryTag && (
                      <div className="absolute top-[72px] left-10 z-20 pointer-events-none">
                        <span 
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase shadow-sm"
                          style={{ 
                            backgroundColor: `${slide.palette.highlightColor}20`, 
                            color: slide.palette.highlightColor,
                            border: `1px solid ${slide.palette.highlightColor}40`
                          }}
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {categoryTag || 'ESTRATÉGIA'}
                        </span>
                      </div>
                    )}

                    {/* SLIDES 2+ : HEADER EDITORIAL COM MARCA D'ÁGUA E NUMERAÇÃO */}
                    {index > 0 && (
                      <div className="absolute top-8 left-0 w-full px-10 flex items-center justify-between z-20 pointer-events-none">
                        {showWatermark ? (
                          <div className="flex items-center gap-2 opacity-80">
                            <div className="w-5 h-5 rounded-full overflow-hidden border border-neutral-300/40 shrink-0">
                              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" crossOrigin="anonymous" />
                            </div>
                            <span style={{ color: slide.palette.textColor }} className="font-bold text-[11px] tracking-tight">
                              {username.startsWith('@') ? username : `@${username}`}
                            </span>
                          </div>
                        ) : <div />}

                        {showSlideCounter && (
                          <span 
                            style={{ color: slide.palette.textColor }} 
                            className="text-[11px] font-mono font-bold tracking-widest opacity-60 bg-black/5 px-2 py-0.5 rounded"
                          >
                            {String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                          </span>
                        )}
                      </div>
                    )}

                    {/* CTA GRAPHIC LAYER */}
                    {slide.isCta && (
                      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-0 opacity-20">
                         {/* We can put a subtle watermark or background graphics here if wanted */}
                      </div>
                    )}

                    {/* BLOCKS (Rnd) */}
                    <div className="absolute left-10 w-[320px] h-[350px] top-[75px]">
                      {slide.blocks.map(block => {
                        const yPx = (block.yPosition / 100) * 350; // 70% of 500px is 350px
                        const handleDragStop = (e: any, d: any) => {
                          const newYPercent = Math.max(0, Math.min(100, (d.y / 350) * 100));
                          updateBlockYPosition(slide.id, block.id, newYPercent);
                        };

                        let content = null;
                        
                        let alignClass = block.align ? `text-${block.align}` : 'text-left';
                        const isUpper = block.uppercase !== undefined ? block.uppercase : (block.type === 'highlight');
                        const upperClass = isUpper ? 'uppercase' : 'normal-case';

                        if (block.type === 'prefix') {
                          content = (
                            <div className={`w-full ${alignClass}`}>
                              <span style={{ color: slide.palette.textColor, fontSize: `${(block.scale || 1) * 1.25}rem`, lineHeight: 1.2 }} className={`font-medium tracking-tight break-words ${upperClass}`}>
                                {block.text}
                              </span>
                            </div>
                          );
                        } else if (block.type === 'highlight') {
                          content = (
                            <div className={`w-full ${alignClass}`}>
                              <h2 style={{ color: slide.palette.highlightColor, fontSize: `${(block.scale || 1) * 78}px`, lineHeight: 0.85 }} className={`font-black tracking-[-0.04em] whitespace-pre-wrap break-words ${upperClass}`}>
                                {block.text}
                              </h2>
                            </div>
                          );
                        } else if (block.type === 'suffix') {
                          content = (
                            <div className={`w-full ${alignClass}`}>
                              <p style={{ color: slide.palette.textColor, fontSize: `${(block.scale || 1) * 1.25}rem`, lineHeight: 1.2 }} className={`font-medium tracking-tight break-words ${upperClass}`}>
                                {block.text}
                              </p>
                            </div>
                          );
                        }

                      const isFocused = focusedBlockId === block.id;

                      return (
                        <Rnd
                          key={block.id}
                          bounds="parent"
                          dragAxis="y"
                          scale={canvasZoom}
                          enableResizing={false}
                          position={{ x: 0, y: yPx }}
                          onDragStop={handleDragStop}
                          className="group w-full cursor-grab active:cursor-grabbing rounded-md z-10"
                          style={{ 
                            boxShadow: (!isExporting && isFocused) ? `0 0 0 2px ${slide.palette.textColor}60` : 'none', 
                            backgroundColor: (!isExporting && isFocused) ? `${slide.palette.textColor}10` : 'transparent' 
                          }}
                        >
                          <div className="export-ignore absolute -left-5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="w-4 h-4" style={{ color: slide.palette.textColor, opacity: 0.4 }} />
                          </div>
                          {content}
                        </Rnd>
                      );
                    })}
                    </div>

                    {/* INSTAGRAM FOOTER MOCKUP (Apenas no primeiro slide) */}
                    {index === 0 && showFooter && (
                      <div className="absolute bottom-10 left-0 w-full px-10 flex items-center justify-between z-20" style={{ color: slide.palette.textColor }}>
                        <div className="flex items-center gap-4">
                          <Heart className="w-[24px] h-[24px] text-red-500 fill-red-500" />
                          <MessageCircle className="w-[24px] h-[24px]" />
                          <Send className="w-[24px] h-[24px]" />
                        </div>
                        {showSlideCounter && (
                          <span className="text-[10px] font-mono font-bold tracking-widest opacity-50">
                            {String(1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                          </span>
                        )}
                        <Bookmark className="w-[24px] h-[24px]" />
                      </div>
                    )}

                    {/* SLIDE 1: CONTADOR QUANDO RODAPÉ ESTIVER OCULTO */}
                    {index === 0 && !showFooter && showSlideCounter && (
                      <div className="absolute bottom-8 left-10 z-20 pointer-events-none">
                        <span 
                          style={{ color: slide.palette.textColor }} 
                          className="text-[11px] font-mono font-bold tracking-widest opacity-60 bg-black/5 px-2 py-0.5 rounded"
                        >
                          {String(1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                        </span>
                      </div>
                    )}

                    {/* INDICADOR DE DESLIZE (ARRASTA PRO LADO) */}
                    {index < slides.length - 1 && showSwipeIndicator && (
                      <div className={`absolute z-20 pointer-events-none ${index === 0 && showFooter ? 'bottom-20 right-10' : 'bottom-8 right-10'}`}>
                        <div 
                          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider shadow-sm uppercase backdrop-blur-sm"
                          style={{ 
                            backgroundColor: `${slide.palette.textColor}12`,
                            color: slide.palette.textColor,
                            border: `1px solid ${slide.palette.textColor}25`
                          }}
                        >
                          <span>{swipeText || 'Arrasta'}</span>
                          <span className="text-xs font-black">➔</span>
                        </div>
                      </div>
                    )}

                    {/* CTA FIXED FOOTER */}
                    {slide.isCta && (
                      <div className="absolute bottom-12 left-0 w-full px-10 flex items-center justify-center gap-8 z-20" style={{ color: slide.palette.textColor }}>
                        <Heart className="w-8 h-8" />
                        <MessageCircle className="w-8 h-8" />
                        <Send className="w-8 h-8" />
                        <Bookmark className="w-8 h-8" style={{ fill: slide.palette.textColor }} />
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>

            {/* BOTOES ADICIONAR SLIDE */}
            {slides.length < 10 && (
              <div className="ml-6 flex flex-col gap-4 shrink-0">
                <button 
                  onClick={addSlide}
                  title="Adicionar Slide de Conteúdo"
                  className="w-16 h-16 bg-white border-2 border-dashed border-neutral-300 rounded-2xl flex items-center justify-center text-neutral-400 hover:text-black hover:border-black transition-all shadow-sm"
                >
                  <Plus className="w-8 h-8" />
                </button>
                <button 
                  onClick={addCtaSlide}
                  title="Adicionar Tela de Encerramento (CTA)"
                  className="w-16 h-16 bg-blue-50 border-2 border-dashed border-blue-300 rounded-2xl flex items-center justify-center text-blue-500 hover:text-blue-700 hover:border-blue-500 transition-all shadow-sm"
                >
                  <Bookmark className="w-6 h-6" />
                </button>
              </div>
            )}
            
            </div> {/* END ZOOM SCALER DIV */}
          </div>
        </div>

      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a1a1aa; }
      `}} />
    </div>
  );
}
