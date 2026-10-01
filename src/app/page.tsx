"use client";

import { useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import { Download, Palette, Type, LayoutTemplate, Plus, Minus, Trash2, GripVertical, Heart, MessageCircle, PlusSquare, Send, Bookmark, BadgeCheck, AlignLeft, AlignCenter, AlignRight, AlignJustify, FolderHeart, Clock, Edit2, ChevronDown, ChevronUp, Maximize2, Minimize2, Layers, Check, Tag, ArrowRight, Sparkles, Bold, Italic, Underline, Strikethrough, SlidersHorizontal, Home as HomeIcon, Copy, ArrowLeft, Camera, Image as ImageIcon, Cloud, CloudOff } from "lucide-react";
import JSZip from "jszip";
import { Rnd } from "react-rnd";
import { 
  fetchCloudTemplates, 
  syncTemplateToCloud, 
  removeTemplateFromCloud, 
  fetchCloudPosts, 
  syncPostToCloud, 
  removePostFromCloud 
} from "@/lib/cloudSync";
import { isSupabaseConfigured } from "@/lib/supabase";

// Fontes disponíveis no estilo Canva
export const AVAILABLE_FONTS = [
  { name: 'Inter', value: "'Inter', sans-serif" },
  { name: 'Poppins', value: "'Poppins', sans-serif" },
  { name: 'Open Sans', value: "'Open Sans', sans-serif" },
  { name: 'Montserrat', value: "'Montserrat', sans-serif" },
  { name: 'Playfair Display', value: "'Playfair Display', serif" },
  { name: 'Bebas Neue', value: "'Bebas Neue', sans-serif" },
  { name: 'Roboto', value: "'Roboto', sans-serif" },
];

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
  fontFamily?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrike?: boolean;
  customColor?: string;
  letterSpacing?: number;
  lineHeight?: number;
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
  // Grupo: FERNANDA
  {
    id: 'fernanda-creme-terracota',
    group: 'FERNANDA',
    name: 'Fernanda Creme & Terracota',
    bgColor: '#FAF8F5',
    textColor: '#1C1917',
    highlightColor: '#E04F16',
    secondaryTextColor: '#5A4644',
  },
  {
    id: 'fernanda-original',
    group: 'FERNANDA',
    name: 'Fernanda Original',
    bgColor: '#EBEBEB',
    textColor: '#64959F',
    highlightColor: '#055367',
    secondaryTextColor: '#5A4644',
  },
  {
    id: 'fernanda-alto-contraste',
    group: 'FERNANDA',
    name: 'Fernanda Alto Contraste',
    bgColor: '#EBEBEB',
    textColor: '#055367',
    highlightColor: '#64959F',
    secondaryTextColor: '#5A4644',
  },
  {
    id: 'fernanda-noturno',
    group: 'FERNANDA',
    name: 'Fernanda Noturno Petróleo',
    bgColor: '#055367',
    textColor: '#FFFFFF',
    highlightColor: '#64959F',
    secondaryTextColor: '#EBEBEB',
  },
  {
    id: 'fernanda-terracota',
    group: 'FERNANDA',
    name: 'Fernanda Terracota',
    bgColor: '#EBEBEB',
    textColor: '#5A4644',
    highlightColor: '#055367',
    secondaryTextColor: '#64959F',
  },
  {
    id: 'fernanda-branco-clean',
    group: 'FERNANDA',
    name: 'Fernanda Branco Clean',
    bgColor: '#FFFFFF',
    textColor: '#055367',
    highlightColor: '#64959F',
    secondaryTextColor: '#5A4644',
  },
  {
    id: 'fernanda-escuro-terroso',
    group: 'FERNANDA',
    name: 'Fernanda Noturno Terroso',
    bgColor: '#5A4644',
    textColor: '#FFFFFF',
    highlightColor: '#64959F',
    secondaryTextColor: '#EBEBEB',
  },
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
    id: 'clean-soft-gray',
    group: 'Elegância Editorial',
    name: 'Soft Grey Clean',
    bgColor: '#f3f4f7',
    textColor: '#1A1A1A',
    highlightColor: '#D9381E',
    secondaryTextColor: '#64748B',
  },
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

export const DEFAULT_SHOWCASE_IMAGES = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
];

type Slide = {
  id: string;
  blocks: TextBlock[];
  palette: ColorPalette;
  isCta?: boolean;
  contentOffsetY?: number;
  layout?: 'text-only' | 'cards-showcase';
  cardImages?: string[];
  showArrow?: boolean;
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

type EditorStep = 'colors' | 'elements' | 'posts';
export type AppView = 'home' | 'templates' | 'editor';

export type DesignTemplate = {
  id: string;
  name: string;
  category: string;
  description: string;
  palette: ColorPalette;
  headerStyle?: HeaderStyle;
  slides: Slide[];
  isCustom?: boolean;
  username?: string;
  avatarUrl?: string;
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

export const BUILT_IN_TEMPLATES: DesignTemplate[] = [
  {
    id: 'fernanda-vitrine-fotos',
    name: 'Vitrine Criativa (Com Fotos)',
    category: 'Criatividade',
    description: 'Estilo viral com título gigante terracota e leque de 3 fotos personalizáveis para mockups e autoridade.',
    palette: DEFAULT_PALETTES.find(p => p.id === 'fernanda-creme-terracota') || DEFAULT_PALETTES[0],
    slides: [
      {
        id: 'tpl-vf-1',
        layout: 'cards-showcase',
        palette: DEFAULT_PALETTES.find(p => p.id === 'fernanda-creme-terracota') || DEFAULT_PALETTES[0],
        cardImages: [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
        ],
        blocks: [
          { id: 'vf-1', type: 'highlight', text: 'Posts\ncriativos', xPosition: 0, yPosition: 20, scale: 0.92, align: 'center', isBold: true, fontFamily: "'Inter', sans-serif" },
          { id: 'vf-2', type: 'suffix', text: 'que quase ninguém faz', xPosition: 0, yPosition: 50, scale: 1.05, align: 'center', isBold: true, fontFamily: "'Inter', sans-serif" },
        ]
      },
      {
        id: 'tpl-vf-2',
        palette: DEFAULT_PALETTES.find(p => p.id === 'fernanda-creme-terracota') || DEFAULT_PALETTES[0],
        blocks: [
          { id: 'vf-3', type: 'prefix', text: 'Estratégia Visual', xPosition: 0, yPosition: 18, scale: 1 },
          { id: 'vf-4', type: 'highlight', text: 'IMPACTO\nNO FEED', xPosition: 0, yPosition: 30, scale: 0.9 },
          { id: 'vf-5', type: 'suffix', text: 'use fotos reais para humanizar sua marca e aumentar o salvamento', xPosition: 0, yPosition: 62, scale: 1 },
        ]
      },
      {
        id: 'tpl-vf-3',
        palette: DEFAULT_PALETTES.find(p => p.id === 'fernanda-creme-terracota') || DEFAULT_PALETTES[0],
        isCta: true,
        blocks: [
          { id: 'vf-6', type: 'prefix', text: 'Gostou do formato?', xPosition: 0, yPosition: 20, scale: 1 },
          { id: 'vf-7', type: 'highlight', text: 'SALVE ESSE\nPOST', xPosition: 0, yPosition: 32, scale: 0.95 },
          { id: 'vf-8', type: 'suffix', text: 'e aplique no seu próximo conteúdo', xPosition: 0, yPosition: 64, scale: 1 },
        ]
      }
    ]
  },
  {
    id: 'fernanda-original-template',
    name: 'Editorial Fernanda',
    category: 'Editorial',
    description: 'Estilo clean e sofisticado com paleta terra e petróleo para autoridade.',
    palette: DEFAULT_PALETTES[0],
    slides: [
      {
        id: 'tpl-1',
        palette: DEFAULT_PALETTES[0],
        blocks: [
          { id: 't1', type: 'prefix', text: 'Guia Prático', xPosition: 0, yPosition: 18, scale: 1 },
          { id: 't2', type: 'highlight', text: 'POSICIONE\nSUA MARCA', xPosition: 0, yPosition: 30, scale: 0.9 },
          { id: 't3', type: 'suffix', text: 'com elegância e autoridade no feed', xPosition: 0, yPosition: 62, scale: 1 },
        ]
      }
    ]
  },
  {
    id: 'alto-contraste-template',
    name: 'Alto Impacto',
    category: 'Vendas & Engajamento',
    description: 'Foco total no título de destaque com máximo contraste para prender a atenção.',
    palette: DEFAULT_PALETTES[1],
    slides: [
      {
        id: 'tpl-ac-1',
        palette: DEFAULT_PALETTES[1],
        blocks: [
          { id: 't4', type: 'prefix', text: 'O Segredo dos', xPosition: 0, yPosition: 18, scale: 1 },
          { id: 't5', type: 'highlight', text: 'TOP 1%\nCRIADORES', xPosition: 0, yPosition: 30, scale: 0.88 },
          { id: 't6', type: 'suffix', text: 'que geram vendas todos os dias', xPosition: 0, yPosition: 62, scale: 1 },
        ]
      }
    ]
  },
  {
    id: 'noturno-petroleo-template',
    name: 'Noturno Corporativo',
    category: 'Negócios',
    description: 'Visual noturno premium em petróleo profundo para tech, negócios e B2B.',
    palette: DEFAULT_PALETTES[2],
    slides: [
      {
        id: 'tpl-np-1',
        palette: DEFAULT_PALETTES[2],
        blocks: [
          { id: 't7', type: 'prefix', text: 'Estratégia Avançada', xPosition: 0, yPosition: 18, scale: 1 },
          { id: 't8', type: 'highlight', text: 'ESCALA\nDE VENDAS', xPosition: 0, yPosition: 30, scale: 0.9 },
          { id: 't9', type: 'suffix', text: 'métodos validados para faturar mais', xPosition: 0, yPosition: 62, scale: 1 },
        ]
      }
    ]
  },
  {
    id: 'minimalista-bw-template',
    name: 'Minimalista P&B',
    category: 'Minimalista',
    description: 'Design atemporal preto e branco com tipografia marcante.',
    palette: DEFAULT_PALETTES.find(p => p.id === 'minimal-white') || DEFAULT_PALETTES[0],
    slides: [
      {
        id: 'tpl-bw-1',
        palette: DEFAULT_PALETTES.find(p => p.id === 'minimal-white') || DEFAULT_PALETTES[0],
        blocks: [
          { id: 't10', type: 'prefix', text: 'Princípio Essencial', xPosition: 0, yPosition: 18, scale: 1 },
          { id: 't11', type: 'highlight', text: 'MENOS É\nMAIS', xPosition: 0, yPosition: 30, scale: 1 },
          { id: 't12', type: 'suffix', text: 'como a simplicidade vende mais rápido', xPosition: 0, yPosition: 62, scale: 1 },
        ]
      }
    ]
  },
  {
    id: 'terracota-template',
    name: 'Terracota Elegante',
    category: 'Editorial',
    description: 'Tons terrosos calorosos para estética, consultoria e desenvolvimento pessoal.',
    palette: DEFAULT_PALETTES.find(p => p.id === 'fernanda-terracota') || DEFAULT_PALETTES[3],
    slides: [
      {
        id: 'tpl-tc-1',
        palette: DEFAULT_PALETTES.find(p => p.id === 'fernanda-terracota') || DEFAULT_PALETTES[3],
        blocks: [
          { id: 't13', type: 'prefix', text: 'Mentalidade', xPosition: 0, yPosition: 18, scale: 1 },
          { id: 't14', type: 'highlight', text: 'HÁBITOS DE\nSUCESSO', xPosition: 0, yPosition: 30, scale: 0.85 },
          { id: 't15', type: 'suffix', text: 'pequenas ações que transformam resultados', xPosition: 0, yPosition: 62, scale: 1 },
        ]
      }
    ]
  },
  {
    id: 'pastel-mint-template',
    name: 'Verde Menta Pastel',
    category: 'Criatividade',
    description: 'Tons suaves e convidativos para saúde, bem-estar, lifestyle e educação.',
    palette: DEFAULT_PALETTES.find(p => p.id === 'pastel-mint') || DEFAULT_PALETTES[0],
    slides: [
      {
        id: 'tpl-pm-1',
        palette: DEFAULT_PALETTES.find(p => p.id === 'pastel-mint') || DEFAULT_PALETTES[0],
        blocks: [
          { id: 't16', type: 'prefix', text: 'Dica Prática', xPosition: 0, yPosition: 18, scale: 1 },
          { id: 't17', type: 'highlight', text: 'ROTI NA\nLEVE', xPosition: 0, yPosition: 30, scale: 0.95 },
          { id: 't18', type: 'suffix', text: 'organize seu dia com leveza e clareza', xPosition: 0, yPosition: 62, scale: 1 },
        ]
      }
    ]
  }
];

export function SlideThumbnail({ 
  slide, 
  username, 
  avatarUrl, 
  showHeader = true 
}: { 
  slide?: Slide; 
  username?: string; 
  avatarUrl?: string; 
  showHeader?: boolean;
}) {
  if (!slide) return null;
  const prefixBlock = slide.blocks?.find(b => b.type === 'prefix');
  const highlightBlock = slide.blocks?.find(b => b.type === 'highlight');
  const suffixBlock = slide.blocks?.find(b => b.type === 'suffix');
  const highlightFont = highlightBlock?.fontFamily || "'Inter', sans-serif";

  return (
    <div 
      className="w-full h-full rounded-xl overflow-hidden relative flex flex-col justify-between p-3 select-none shadow-xs border border-black/5 isolate z-0"
      style={{ backgroundColor: slide.palette?.bgColor || '#ffffff' }}
    >
      {/* Header mini */}
      {showHeader ? (
        <div className="flex items-center gap-1.5 opacity-85">
          <div className="w-3.5 h-3.5 rounded-full overflow-hidden bg-neutral-200 border border-black/10 shrink-0">
            {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : null}
          </div>
          <span className="text-[8.5px] font-bold truncate max-w-[70px]" style={{ color: slide.palette?.textColor || '#000000' }}>
            {username || '@usuário'}
          </span>
        </div>
      ) : <div className="h-2" />}

      {/* Content mini (Auto-Layout Stack ou Vitrine de Cards) */}
      {slide.layout === 'cards-showcase' ? (
        <div className="flex-1 flex flex-col justify-between my-0.5 w-full overflow-hidden">
          <div className="flex flex-col gap-0.5 text-center px-0.5">
            {highlightBlock && (() => {
              const isUpper = highlightBlock.uppercase !== undefined ? highlightBlock.uppercase : true;
              return (
                <span 
                  className={`text-[9.5px] font-black tracking-tight line-clamp-2 leading-[0.9] ${isUpper ? 'uppercase' : 'normal-case'}`}
                  style={{ 
                    color: highlightBlock.customColor || slide.palette?.highlightColor || '#E04F16',
                    fontFamily: highlightFont
                  }}
                >
                  {highlightBlock.text}
                </span>
              );
            })()}
            {suffixBlock && (() => {
              const isUpper = suffixBlock.uppercase !== undefined ? suffixBlock.uppercase : false;
              return (
                <span 
                  className={`text-[6px] font-bold line-clamp-1 opacity-80 ${isUpper ? 'uppercase' : 'normal-case'}`} 
                  style={{ color: suffixBlock.customColor || slide.palette?.textColor }}
                >
                  {suffixBlock.text}
                </span>
              );
            })()}
          </div>

          {/* Mini 3-Card Fan */}
          <div className="relative w-full h-[46px] flex items-center justify-center my-auto">
            {/* Left */}
            <div className="absolute w-[22px] h-[32px] rounded-[3px] overflow-hidden shadow-xs -translate-x-3.5 translate-y-1 -rotate-6 border border-white/60 bg-neutral-200">
              <img src={slide.cardImages?.[0] || DEFAULT_SHOWCASE_IMAGES[0]} className="w-full h-full object-cover" alt="" />
            </div>
            {/* Right */}
            <div className="absolute w-[22px] h-[32px] rounded-[3px] overflow-hidden shadow-xs translate-x-3.5 translate-y-1 rotate-6 border border-white/60 bg-neutral-200">
              <img src={slide.cardImages?.[2] || DEFAULT_SHOWCASE_IMAGES[2]} className="w-full h-full object-cover" alt="" />
            </div>
            {/* Center */}
            <div className="absolute w-[26px] h-[36px] rounded-[4px] overflow-hidden shadow-md -translate-y-0.5 z-10 border border-white bg-neutral-900">
              <img src={slide.cardImages?.[1] || DEFAULT_SHOWCASE_IMAGES[1]} className="w-full h-full object-cover" alt="" />
            </div>
          </div>

          {/* Mini footer */}
          <div className="flex items-center justify-between px-0.5 text-[6.5px] font-bold opacity-75" style={{ color: slide.palette?.textColor || '#000000' }}>
            <span className="truncate max-w-[65px]">{username || '@usuário'}</span>
            <span>→</span>
          </div>
        </div>
      ) : (
        <>
          <div className="my-auto flex flex-col gap-0.5 w-full">
            {prefixBlock && (
              <span className="text-[7.5px] font-semibold truncate leading-tight opacity-90" style={{ color: prefixBlock.customColor || slide.palette?.textColor }}>
                {prefixBlock.text}
              </span>
            )}
            {highlightBlock && (
              <span 
                className="text-[13px] font-black uppercase tracking-tight line-clamp-2 leading-[0.88]"
                style={{ 
                  color: highlightBlock.customColor || slide.palette?.highlightColor || '#000000',
                  fontFamily: highlightFont
                }}
              >
                {highlightBlock.text}
              </span>
            )}
            {suffixBlock && (
              <span className="text-[7px] font-normal truncate opacity-80 leading-tight" style={{ color: suffixBlock.customColor || slide.palette?.textColor }}>
                {suffixBlock.text}
              </span>
            )}
          </div>

          {/* Footer mini */}
          <div className="flex items-center gap-1 opacity-60 text-[7px]" style={{ color: slide.palette?.textColor || '#000000' }}>
            <Heart className="w-2 h-2 text-red-500 fill-red-500" />
            <MessageCircle className="w-2 h-2" />
            <Send className="w-2 h-2" />
          </div>
        </>
      )}
    </div>
  );
}

export function formatRelativeDate(dateStr?: string) {
  if (!dateStr) return 'Recente';
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 5) return 'Editado agora';
    if (diffMins < 60) return `Editado há ${diffMins} min`;
    if (diffHours < 24) return `Editado há ${diffHours} h`;
    if (diffDays === 1) return 'Editado ontem';
    if (diffDays < 30) return `Editado há ${diffDays} dias`;
    return new Date(dateStr).toLocaleDateString('pt-BR');
  } catch {
    return 'Recente';
  }
}

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
  const [activeStep, setActiveStep] = useState<EditorStep>('colors');
  const [globalPalette, setGlobalPalette] = useState<ColorPalette>(DEFAULT_PALETTES[0]);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [projectName, setProjectName] = useState<string>('');
  const [currentPostId, setCurrentPostId] = useState<string | null>(null);
  const [username, setUsername] = useState('@usuário');
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
      const sideCard = document.getElementById(`sidebar-card-${slideId}`);
      if (sideCard) {
        sideCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };
  
  const [savedPostsList, setSavedPostsList] = useState<SavedPost[]>([]);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [customTemplates, setCustomTemplates] = useState<DesignTemplate[]>([]);
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>('Todos');

  useEffect(() => {
    try {
      const savedTpls = JSON.parse(localStorage.getItem('customTemplates') || '[]');
      setCustomTemplates(savedTpls);
    } catch (e) {
      console.error("Erro ao carregar modelos customizados:", e);
    }
  }, []);
  const [draggingGroupSlideId, setDraggingGroupSlideId] = useState<string | null>(null);
  const dragStartYRef = useRef<number>(0);
  const initialOffsetYRef = useRef<number>(0);

  const updateSlideContentOffsetY = (slideId: string, offsetY: number) => {
    setSlides(prev => prev.map(s => s.id === slideId ? { ...s, contentOffsetY: offsetY } : s));
  };

  const handleGroupDragStart = (slideId: string, initialY: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingGroupSlideId(slideId);
    dragStartYRef.current = e.clientY;
    initialOffsetYRef.current = initialY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = (moveEvent.clientY - dragStartYRef.current) / canvasZoom;
      const clampedY = Math.max(-80, Math.min(80, Math.round(initialOffsetYRef.current + deltaY)));
      setSlides(prev => prev.map(s => s.id === slideId ? { ...s, contentOffsetY: clampedY } : s));
    };

    const handleMouseUp = () => {
      setDraggingGroupSlideId(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleFlexibleDragStart = (slideId: string, initialY: number, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const startY = e.clientY;
    let isDragging = false;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dist = Math.abs(moveEvent.clientY - startY);
      if (!isDragging && dist > 3) {
        isDragging = true;
        setDraggingGroupSlideId(slideId);
      }
      if (isDragging) {
        const deltaY = (moveEvent.clientY - startY) / canvasZoom;
        const clampedY = Math.max(-80, Math.min(80, Math.round(initialY + deltaY)));
        setSlides(prev => prev.map(s => s.id === slideId ? { ...s, contentOffsetY: clampedY } : s));
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setDraggingGroupSlideId(null);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Ao abrir a página, se houver postagens salvas, puxa a última como padrão com posições alinhadas
  useEffect(() => {
    try {
      const saved: SavedPost[] = JSON.parse(localStorage.getItem('savedPosts') || '[]');
      
      // Sanitizar postagens antigas para corrigir o alinhamento e padronizar username para @usuário
      const sanitizedSaved = saved.map(post => ({
        ...post,
        username: (!post.username || post.username === 'davis4n') ? '@usuário' : post.username,
        slides: post.slides.map(slide => ({
          ...slide,
          blocks: slide.blocks.map(b => {
            if (b.type === 'suffix' && (b.yPosition >= 75 || b.yPosition === 80)) {
              return { ...b, yPosition: 62 };
            }
            if (b.type === 'prefix' && b.yPosition === 15) {
              return { ...b, yPosition: 18 };
            }
            if (b.type === 'highlight' && b.yPosition === 35) {
              return { ...b, yPosition: 30 };
            }
            return b;
          })
        }))
      }));

      if (JSON.stringify(sanitizedSaved) !== JSON.stringify(saved)) {
        localStorage.setItem('savedPosts', JSON.stringify(sanitizedSaved));
      }
      setSavedPostsList(sanitizedSaved);

      if (sanitizedSaved.length > 0 && sanitizedSaved[0]) {
        const latestPost = sanitizedSaved[0];
        if (latestPost.slides && latestPost.slides.length > 0) {
          setCurrentPostId(latestPost.id);
          setSlides(latestPost.slides);
          if (latestPost.name) setProjectName(latestPost.name);
          setUsername((!latestPost.username || latestPost.username === 'davis4n') ? '@usuário' : latestPost.username);
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

    // Sincronização e Migração Bidirecional com a Nuvem (Supabase)
    if (isSupabaseConfigured) {
      try {
        const localSaved: SavedPost[] = JSON.parse(localStorage.getItem('savedPosts') || '[]');
        
        fetchCloudPosts([]).then(async (cloudPosts) => {
          if (cloudPosts && cloudPosts.length > 0) {
            // Nuvem tem posts: se local tiver posts não sincronizados, sobe eles para a nuvem
            const cloudIds = new Set(cloudPosts.map(p => p.id));
            const missingInCloud = localSaved.filter(p => !cloudIds.has(p.id));
            for (const missingPost of missingInCloud) {
              await syncPostToCloud(missingPost);
            }
            const allPosts = [...missingInCloud, ...cloudPosts] as SavedPost[];
            setSavedPostsList(allPosts);
            localStorage.setItem('savedPosts', JSON.stringify(allPosts));
          } else if (localSaved && localSaved.length > 0) {
            // Nuvem estava vazia: migra automaticamente todo o histórico local existente para o Supabase!
            for (const post of localSaved) {
              await syncPostToCloud(post);
            }
            setSavedPostsList(localSaved);
          }
        });

        const localTemplates: DesignTemplate[] = JSON.parse(localStorage.getItem('customTemplates') || '[]');
        fetchCloudTemplates([]).then(async (cloudTemplates) => {
          if (cloudTemplates && cloudTemplates.length > 0) {
            const cloudIds = new Set(cloudTemplates.map(t => t.id));
            const missingInCloud = localTemplates.filter(t => !cloudIds.has(t.id));
            for (const missingTpl of missingInCloud) {
              await syncTemplateToCloud(missingTpl);
            }
            const allTpls = [...missingInCloud, ...cloudTemplates] as DesignTemplate[];
            setCustomTemplates(allTpls);
            localStorage.setItem('customTemplates', JSON.stringify(allTpls));
          } else if (localTemplates && localTemplates.length > 0) {
            for (const tpl of localTemplates) {
              await syncTemplateToCloud(tpl);
            }
            setCustomTemplates(localTemplates);
          }
        });
      } catch (err) {
        console.warn("Aviso ao sincronizar dados da nuvem:", err);
      }
    }
  }, []);

  // Sempre que alternar para a tela inicial ou modelos, busca atualizações mais recentes na nuvem
  useEffect(() => {
    if (isSupabaseConfigured && (currentView === 'home' || currentView === 'templates')) {
      fetchCloudPosts([]).then(cloudPosts => {
        if (cloudPosts && cloudPosts.length > 0) {
          setSavedPostsList(cloudPosts as SavedPost[]);
          localStorage.setItem('savedPosts', JSON.stringify(cloudPosts));
        }
      });
      fetchCloudTemplates([]).then(cloudTemplates => {
        if (cloudTemplates && cloudTemplates.length > 0) {
          setCustomTemplates(cloudTemplates as DesignTemplate[]);
          localStorage.setItem('customTemplates', JSON.stringify(cloudTemplates));
        }
      });
    }
  }, [currentView]);

  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualCloudSync = async () => {
    if (!isSupabaseConfigured) {
      alert("A sincronização em nuvem não está configurada neste ambiente.");
      return;
    }
    setIsSyncing(true);
    try {
      const localSaved: SavedPost[] = JSON.parse(localStorage.getItem('savedPosts') || '[]');
      const cloudPosts = await fetchCloudPosts([]);
      if (cloudPosts && cloudPosts.length > 0) {
        const cloudIds = new Set(cloudPosts.map(p => p.id));
        const missingInCloud = localSaved.filter(p => !cloudIds.has(p.id));
        for (const missingPost of missingInCloud) {
          await syncPostToCloud(missingPost);
        }
        const allPosts = [...missingInCloud, ...cloudPosts] as SavedPost[];
        setSavedPostsList(allPosts);
        localStorage.setItem('savedPosts', JSON.stringify(allPosts));
      } else if (localSaved && localSaved.length > 0) {
        for (const p of localSaved) {
          await syncPostToCloud(p);
        }
        setSavedPostsList(localSaved);
      }

      const localTemplates: DesignTemplate[] = JSON.parse(localStorage.getItem('customTemplates') || '[]');
      const cloudTemplates = await fetchCloudTemplates([]);
      if (cloudTemplates && cloudTemplates.length > 0) {
        const cloudIds = new Set(cloudTemplates.map(t => t.id));
        const missingInCloud = localTemplates.filter(t => !cloudIds.has(t.id));
        for (const missingTpl of missingInCloud) {
          await syncTemplateToCloud(missingTpl);
        }
        const allTpls = [...missingInCloud, ...cloudTemplates] as DesignTemplate[];
        setCustomTemplates(allTpls);
        localStorage.setItem('customTemplates', JSON.stringify(allTpls));
      } else if (localTemplates && localTemplates.length > 0) {
        for (const t of localTemplates) {
          await syncTemplateToCloud(t);
        }
        setCustomTemplates(localTemplates);
      }
      alert("Sincronização com o Supabase concluída com sucesso! Todo o seu histórico está na nuvem.");
    } catch (e) {
      console.error("Erro na sincronização manual:", e);
      alert("Ocorreu um erro ao sincronizar com o Supabase. Tente novamente.");
    } finally {
      setIsSyncing(false);
    }
  };

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
      setCurrentPostId(post.id);
      setSlides(post.slides);
      if (post.name) setProjectName(post.name);
      setUsername((!post.username || post.username === 'davis4n') ? '@usuário' : post.username);
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
        if (currentPostId === postId) {
          setCurrentPostId(null);
        }
        if (isSupabaseConfigured) {
          removePostFromCloud(postId);
        }
      } catch (e) {
        console.error("Erro ao excluir postagem", e);
      }
    }
  };

  const openPostInEditor = (post: SavedPost) => {
    setCurrentPostId(post.id);
    setSlides(post.slides);
    if (post.name) setProjectName(post.name);
    setUsername((!post.username || post.username === 'davis4n') ? '@usuário' : post.username);
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
    setCurrentView('editor');
  };

  const createNewBlankCarousel = () => {
    savePostLocally();
    const newSlideId = Date.now().toString();
    const cleanSlide: Slide = {
      id: newSlideId,
      palette: DEFAULT_PALETTES[0],
      blocks: [
        { id: newSlideId + '-1', type: 'prefix', text: 'Novo Tópico', xPosition: 0, yPosition: 18, scale: 1 },
        { id: newSlideId + '-2', type: 'highlight', text: 'INSERIR\nTÍTULO', xPosition: 0, yPosition: 30, scale: 1 },
        { id: newSlideId + '-3', type: 'suffix', text: 'adicione sua legenda ou contexto aqui', xPosition: 0, yPosition: 62, scale: 1 },
      ]
    };
    setSlides([cleanSlide]);
    setProjectName('');
    setUsername('@usuário');
    setActiveSlideId(newSlideId);
    setGlobalPalette(DEFAULT_PALETTES[0]);
    setCurrentPostId(null);
    setCurrentView('editor');
  };

  const duplicatePost = (post: SavedPost) => {
    try {
      const saved = JSON.parse(localStorage.getItem('savedPosts') || '[]');
      const copy: SavedPost = {
        ...post,
        id: Date.now().toString(),
        name: `Cópia de ${post.name || 'Carrossel'}`,
        date: new Date().toISOString(),
        slides: JSON.parse(JSON.stringify(post.slides))
      };
      const updated = [copy, ...saved];
      localStorage.setItem('savedPosts', JSON.stringify(updated));
      setSavedPostsList(updated);
    } catch (e) {
      console.error("Erro ao duplicar postagem:", e);
    }
  };

  const applyTemplate = (template: DesignTemplate) => {
    savePostLocally();
    const clonedSlides = JSON.parse(JSON.stringify(template.slides));
    const timestamp = Date.now();
    const preparedSlides = clonedSlides.map((s: Slide, idx: number) => ({
      ...s,
      id: `${timestamp}-${idx}`,
      palette: s.palette ? { ...s.palette } : { ...template.palette },
      cardImages: s.cardImages ? [...s.cardImages] : undefined,
      blocks: s.blocks.map((b: TextBlock, bIdx: number) => ({
        ...b,
        id: `${timestamp}-${idx}-${bIdx}`
      }))
    }));

    setSlides(preparedSlides);
    setGlobalPalette(template.palette);
    setProjectName(template.name);
    setCurrentPostId(null);

    // Restaurar todas as configurações de layout, branding e retenção do modelo
    if (template.headerStyle) setHeaderStyle(template.headerStyle);
    if (template.showHeader !== undefined) setShowHeader(template.showHeader);
    if (template.showFooter !== undefined) setShowFooter(template.showFooter);
    if (template.showVerifiedBadge !== undefined) setShowVerifiedBadge(template.showVerifiedBadge);
    if (template.showProgressBar !== undefined) setShowProgressBar(template.showProgressBar);
    if (template.showSlideCounter !== undefined) setShowSlideCounter(template.showSlideCounter);
    if (template.showSwipeIndicator !== undefined) setShowSwipeIndicator(template.showSwipeIndicator);
    if (template.swipeText !== undefined) setSwipeText(template.swipeText);
    if (template.showCategoryTag !== undefined) setShowCategoryTag(template.showCategoryTag);
    if (template.categoryTag !== undefined) setCategoryTag(template.categoryTag);
    if (template.showWatermark !== undefined) setShowWatermark(template.showWatermark);
    if (template.username) setUsername(template.username);
    if (template.avatarUrl) setAvatarUrl(template.avatarUrl);

    if (preparedSlides[0]?.id) {
      focusAndCenterSlide(preparedSlides[0].id);
    }
    setCurrentView('editor');
  };

  const saveCurrentAsTemplate = (customName?: string) => {
    try {
      const templates = JSON.parse(localStorage.getItem('customTemplates') || '[]');
      const defaultName = projectName.trim() || 'Modelo Customizado';
      const name = customName || prompt('Nome do novo modelo de design:', defaultName);
      if (!name || !name.trim()) return;

      const newTpl: DesignTemplate = {
        id: `custom-tpl-${Date.now()}`,
        name: name.trim(),
        category: 'Meus Modelos',
        description: 'Modelo personalizado com fotos, textos e cores completas.',
        palette: { ...globalPalette },
        slides: JSON.parse(JSON.stringify(slides)),
        username,
        avatarUrl,
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
        showWatermark,
        isCustom: true
      };

      const updated = [newTpl, ...templates];
      localStorage.setItem('customTemplates', JSON.stringify(updated));
      setCustomTemplates(updated);
      if (isSupabaseConfigured) {
        syncTemplateToCloud(newTpl);
      }
      alert(`Modelo "${name.trim()}" salvo com sucesso na aba Modelos!`);
    } catch (e) {
      console.error("Erro ao salvar modelo:", e);
    }
  };

  const deleteCustomTemplate = (templateId: string) => {
    if (confirm("Tem certeza que deseja excluir este modelo personalizado?")) {
      try {
        const templates = JSON.parse(localStorage.getItem('customTemplates') || '[]');
        const updated = templates.filter((t: DesignTemplate) => t.id !== templateId);
        localStorage.setItem('customTemplates', JSON.stringify(updated));
        setCustomTemplates(updated);
        if (isSupabaseConfigured) {
          removeTemplateFromCloud(templateId);
        }
      } catch (e) {
        console.error("Erro ao excluir modelo:", e);
      }
    }
  };

  const [slides, setSlides] = useState<Slide[]>([
    {
      id: "1",
      palette: DEFAULT_PALETTES[0],
      blocks: [
        { id: 'b1', type: 'prefix', text: 'Aprenda a criar', xPosition: 0, yPosition: 18, scale: 1 },
        { id: 'b2', type: 'highlight', text: 'CARRO\nSSEIS', xPosition: 0, yPosition: 30, scale: 1 },
        { id: 'b3', type: 'suffix', text: 'que chamam a atenção', xPosition: 0, yPosition: 62, scale: 1 },
      ]
    },
  ]);
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardInputRefs = useRef<Record<string, HTMLInputElement>>({});

  const updateSlideCardImage = (slideId: string, cardIndex: number, newImageUrl: string) => {
    setSlides(prev => prev.map(s => {
      if (s.id !== slideId) return s;
      const images = s.cardImages ? [...s.cardImages] : [...DEFAULT_SHOWCASE_IMAGES];
      images[cardIndex] = newImageUrl;
      return {
        ...s,
        cardImages: images
      };
    }));
  };

  const toggleSlideLayout = (slideId: string, layout: 'text-only' | 'cards-showcase') => {
    setSlides(prev => prev.map(s => {
      if (s.id !== slideId) return s;
      return {
        ...s,
        layout,
        cardImages: s.cardImages || [...DEFAULT_SHOWCASE_IMAGES]
      };
    }));
  };

  // Estados de popovers da Barra de Formatação estilo Canva
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isSpacingOpen, setIsSpacingOpen] = useState(false);
  const [isPositionOpen, setIsPositionOpen] = useState(false);

  // Bloco e Slide atualmente ativos na barra Canva
  const currentSlide = slides.find(s => s.id === activeSlideId) || slides[0] || { id: '1', palette: DEFAULT_PALETTES[0], blocks: [] };
  const currentBlock = currentSlide?.blocks.find(b => b.id === focusedBlockId) 
    || currentSlide?.blocks.find(b => b.type === 'highlight') 
    || currentSlide?.blocks[0];

  const updateBlockProperty = (slideId: string, blockId: string, updates: Partial<TextBlock>) => {
    setSlides(prev => prev.map(s => {
      if (s.id !== slideId) return s;
      return {
        ...s,
        blocks: s.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b)
      };
    }));
  };

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
          { id: newId + '1', type: 'prefix', text: template.prefix, xPosition: 0, yPosition: 18, scale: 1 },
          { id: newId + '2', type: 'highlight', text: template.highlight, xPosition: 0, yPosition: 30, scale: 1 },
          { id: newId + '3', type: 'suffix', text: template.suffix, xPosition: 0, yPosition: 62, scale: 1 },
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
          { id: newId + '1', type: 'prefix', text: 'Gostou do post?', xPosition: 0, yPosition: 18, scale: 1 },
          { id: newId + '2', type: 'highlight', text: 'SALVE\nAGORA', xPosition: 0, yPosition: 30, scale: 0.9 },
          { id: newId + '3', type: 'suffix', text: 'Para aplicar depois no seu perfil', xPosition: 0, yPosition: 62, scale: 1 },
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

  const savePostLocally = (customName?: string, asNew: boolean = false) => {
    try {
      const saved: SavedPost[] = JSON.parse(localStorage.getItem('savedPosts') || '[]');
      const firstHighlight = slides[0]?.blocks.find(b => b.type === 'highlight')?.text.replace(/\n/g, ' ') || `Carrossel ${saved.length + 1}`;
      const name = customName || projectName.trim() || firstHighlight;

      const targetId = (!asNew && currentPostId) ? currentPostId : Date.now().toString();
      const isExisting = !asNew && currentPostId && saved.some((p: SavedPost) => p.id === currentPostId);

      const postData: SavedPost = {
        id: targetId,
        name,
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

      let updated: SavedPost[];
      if (isExisting) {
        // Atualiza exatamente no mesmo conteúdo mantendo a posição original no histórico
        updated = saved.map((p: SavedPost) => p.id === targetId ? postData : p);
      } else {
        // Novo conteúdo adicionado ao início do histórico
        updated = [postData, ...saved.filter((p: SavedPost) => p.id !== targetId).slice(0, 14)];
      }

      localStorage.setItem('savedPosts', JSON.stringify(updated));
      setSavedPostsList(updated);
      setCurrentPostId(targetId);
      if (isSupabaseConfigured) {
        syncPostToCloud(postData);
      }
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
    setEditingBlockId(null);
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
          <div className="w-64 bg-white border-r border-neutral-200 flex flex-col p-6 shrink-0 gap-2 overflow-y-auto z-10 custom-scrollbar h-full min-h-0 max-h-screen pb-24">
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
      case 'elements':
        return (
          <div className="w-80 bg-white border-r border-neutral-200 flex flex-col shrink-0 z-10 h-full min-h-0 max-h-screen overflow-y-auto custom-scrollbar p-6 gap-6 pb-28">
            <div>
              <h2 className="font-bold text-sm text-neutral-800 uppercase tracking-wider mb-1">Elementos da Página</h2>
              <p className="text-[11px] text-neutral-500">Configure o cabeçalho superior e o rodapé do carrossel.</p>
            </div>

            {/* SEÇÃO LAYOUT & FOTOS DO SLIDE ATUAL */}
            <div className="flex flex-col gap-3 border border-neutral-200 rounded-xl p-4 bg-neutral-50/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-neutral-800 uppercase tracking-wide">Layout & Fotos</span>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">Slide Atual</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => toggleSlideLayout(currentSlide.id, 'text-only')}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    (!currentSlide.layout || currentSlide.layout === 'text-only')
                      ? 'border-blue-500 bg-white ring-2 ring-blue-500/20 text-blue-700 shadow-xs'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  Apenas Texto
                </button>
                <button
                  type="button"
                  onClick={() => toggleSlideLayout(currentSlide.id, 'cards-showcase')}
                  className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    currentSlide.layout === 'cards-showcase'
                      ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-600/20 text-purple-700 shadow-xs'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  Vitrine (3 Fotos)
                </button>
              </div>

              {currentSlide.layout === 'cards-showcase' && (
                <div className="flex flex-col gap-2.5 mt-1 pt-3 border-t border-neutral-200/80">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Fotos do Slide</span>
                  <div className="grid grid-cols-3 gap-2">
                    {['Esquerda', 'Centro', 'Direita'].map((label, idx) => (
                      <div key={label} className="flex flex-col items-center gap-1.5">
                        <div className="w-16 h-22 rounded-xl overflow-hidden border border-neutral-300 bg-neutral-100 relative group shadow-xs">
                          <img 
                            src={currentSlide.cardImages?.[idx] || DEFAULT_SHOWCASE_IMAGES[idx]} 
                            alt={label} 
                            className="w-full h-full object-cover" 
                          />
                          <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer text-center p-1">
                            <Camera className="w-4 h-4 mb-0.5" />
                            <span className="text-[8px] font-bold uppercase">Trocar</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    if (ev.target?.result) updateSlideCardImage(currentSlide.id, idx, ev.target.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} 
                            />
                          </label>
                        </div>
                        <span className="text-[10px] font-semibold text-neutral-600">{label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-neutral-500 text-center mt-1 leading-tight">
                    💡 <strong>Dica:</strong> Você também pode clicar diretamente em qualquer foto no slide para trocá-la!
                  </p>
                </div>
              )}
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
                  placeholder="@usuário"
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
          <div className="w-80 bg-white border-r border-neutral-200 h-full flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)] min-h-0 max-h-screen overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex-shrink-0">
              <h2 className="font-bold text-lg text-neutral-800 tracking-tight">Suas Postagens</h2>
              <p className="text-xs text-neutral-500 mt-1">Carrosséis salvos automaticamente ao exportar.</p>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-6 flex flex-col gap-3 custom-scrollbar pb-24">
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
                          <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{post.username?.startsWith('@') ? post.username : `@${post.username || 'usuário'}`}</span>
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

  const allTemplates = [...customTemplates, ...BUILT_IN_TEMPLATES];
  const allTemplatesFiltered = templateCategoryFilter === 'Todos'
    ? allTemplates
    : templateCategoryFilter === 'Meus Modelos'
    ? allTemplates.filter(t => t.isCustom)
    : allTemplates.filter(t => t.category === templateCategoryFilter);

  // SE ESTIVER NA TELA PRINCIPAL (INÍCIO OU MODELOS)
  if (currentView === 'home' || currentView === 'templates') {
    return (
      <div className="flex flex-col h-screen w-full bg-[#f8f9fc] font-sans text-neutral-900 overflow-hidden">
        {/* TOPBAR ESTILO CANVA (COM PILLS INÍCIO / MODELOS) */}
        <nav className="h-16 bg-white border-b border-neutral-200 px-6 sm:px-8 flex items-center justify-between shrink-0 z-30 shadow-xs">
          <div className="flex items-center gap-6">
            <div 
              onClick={() => setCurrentView('home')} 
              className="flex items-center gap-2.5 cursor-pointer font-black text-lg text-neutral-900 tracking-tight group"
              title="Carrossel Maker"
            >
              <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="7" y="3" width="13" height="15" rx="2" />
                  <rect x="4" y="6" width="13" height="15" rx="2" fill="currentColor" fillOpacity="0.25" />
                </svg>
              </div>
              <span className="hidden sm:inline font-black tracking-tight text-neutral-900">Carrosséis</span>
            </div>

            {/* PILLS DE NAVEGAÇÃO: INÍCIO / MODELOS (IGUAL AO PRINT DO USUÁRIO) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentView('home')}
                className={`flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs font-bold transition-all ${
                  currentView === 'home'
                    ? 'bg-purple-100/80 text-purple-700 border-2 border-purple-600 shadow-xs'
                    : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
                }`}
              >
                <HomeIcon className="w-4 h-4" />
                <span>Início</span>
              </button>

              <button
                type="button"
                onClick={() => setCurrentView('templates')}
                className={`flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs font-bold transition-all ${
                  currentView === 'templates'
                    ? 'bg-purple-100/80 text-purple-700 border-2 border-purple-600 shadow-xs'
                    : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
                }`}
              >
                <LayoutTemplate className="w-4 h-4" />
                <span>Modelos</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status de Sincronização em Nuvem (Clicável para forçar sincronia) */}
            <button 
              type="button"
              onClick={handleManualCloudSync}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all border ${
                isSupabaseConfigured 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer active:scale-95' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              } ${isSyncing ? 'opacity-75 animate-pulse' : ''}`}
              title={
                isSupabaseConfigured 
                  ? 'Nuvem Supabase ativa! Clique para sincronizar agora.'
                  : 'Modo Local (salvo neste navegador).'
              }
            >
              {isSupabaseConfigured ? (
                <>
                  <Cloud className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="hidden md:inline">{isSyncing ? 'Sincronizando...' : 'Nuvem Conectada'}</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden md:inline">Salvo Localmente</span>
                </>
              )}
            </button>

            {slides.length > 0 && (
              <button
                type="button"
                onClick={() => setCurrentView('editor')}
                className="text-xs font-bold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-3.5 py-2 rounded-xl transition-all flex items-center gap-2"
              >
                <span>Continuar no Editor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={createNewBlankCarousel}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Carrossel</span>
            </button>
          </div>
        </nav>

        {/* TELA DE INÍCIO */}
        {currentView === 'home' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 max-w-7xl mx-auto w-full flex flex-col gap-10">
            {/* SEÇÃO: CONTINUAR CRIANDO DESIGNS */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                    Continuar criando designs
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Seus carrosséis recentes salvos. Clique para continuar editando.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={createNewBlankCarousel}
                  className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo em branco</span>
                </button>
              </div>

              {/* GRID DE CARDS COM PREVIEW VISUAL */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* CARD: CRIAR EM BRANCO */}
                <div
                  onClick={createNewBlankCarousel}
                  className="group flex flex-col gap-2.5 cursor-pointer"
                >
                  <div className="w-full aspect-[4/3] bg-neutral-100/90 rounded-2xl p-4 flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 hover:border-purple-500 hover:bg-purple-50/30 transition-all shadow-xs">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-neutral-200 flex items-center justify-center text-neutral-600 group-hover:text-purple-600 group-hover:scale-110 transition-all">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-neutral-600 group-hover:text-purple-700 mt-2 text-center">
                      Inserir um título
                    </span>
                  </div>
                  <div className="flex flex-col px-0.5">
                    <span className="font-bold text-xs text-neutral-800 group-hover:text-purple-700 truncate">Novo Carrossel</span>
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-0.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Plus className="w-2 h-2" />
                      </div>
                      <span>Em branco • 1080 × 1350</span>
                    </div>
                  </div>
                </div>

                {/* POSTS SALVOS */}
                {savedPostsList.map((post) => (
                  <div
                    key={post.id}
                    onClick={() => openPostInEditor(post)}
                    className="group flex flex-col gap-2.5 cursor-pointer"
                  >
                    <div className="w-full aspect-[4/3] bg-neutral-100/80 rounded-2xl p-2.5 flex items-center justify-center border border-neutral-200/90 group-hover:border-purple-500 group-hover:shadow-md transition-all relative overflow-hidden">
                      <div className="w-[105px] h-[130px]">
                        <SlideThumbnail
                          slide={post.slides[0]}
                          username={post.username}
                          avatarUrl={post.avatarUrl}
                          showHeader={post.showHeader}
                        />
                      </div>

                      <div className="absolute inset-0 z-30 bg-neutral-900/30 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openPostInEditor(post);
                          }}
                          className="bg-white hover:bg-purple-50 text-neutral-800 p-2 rounded-full shadow-md hover:scale-105 transition-transform"
                          title="Editar carrossel"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-purple-700" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicatePost(post);
                          }}
                          className="bg-white hover:bg-blue-50 text-neutral-800 p-2 rounded-full shadow-md hover:scale-105 transition-transform"
                          title="Fazer uma cópia"
                        >
                          <Copy className="w-3.5 h-3.5 text-blue-700" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePost(post.id);
                          }}
                          className="bg-white hover:bg-red-50 text-neutral-800 p-2 rounded-full shadow-md hover:scale-105 transition-transform"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col px-0.5 min-w-0">
                      <span className="font-bold text-xs text-neutral-800 truncate group-hover:text-purple-700 transition-colors">
                        {post.name || 'Sem título'}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mt-0.5">
                        <div className="w-3.5 h-3.5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                          <Sparkles className="w-2 h-2" />
                        </div>
                        <span className="truncate">
                          {post.slides.length} slides • {formatRelativeDate(post.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SEÇÃO: MODELOS RECOMENDADOS */}
            <section className="flex flex-col gap-4 border-t border-neutral-200/80 pt-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-neutral-900 tracking-tight">
                    Modelos Recomendados
                  </h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Comece com uma estrutura profissional e personalize como quiser.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentView('templates')}
                  className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 hover:underline"
                >
                  <span>Ver todos os modelos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {BUILT_IN_TEMPLATES.slice(0, 4).map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => applyTemplate(tpl)}
                    className="group flex flex-col gap-2.5 cursor-pointer"
                  >
                    <div className="w-full aspect-[4/3] bg-neutral-100/80 rounded-2xl p-2.5 flex items-center justify-center border border-neutral-200/90 group-hover:border-purple-500 group-hover:shadow-md transition-all relative overflow-hidden">
                      <div className="w-[105px] h-[130px]">
                        <SlideThumbnail
                          slide={tpl.slides[0]}
                          username="@usuário"
                          showHeader={true}
                        />
                      </div>

                      <div className="absolute inset-0 z-30 bg-neutral-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3">
                        <button
                          type="button"
                          className="bg-white text-purple-700 font-bold text-xs px-3.5 py-2 rounded-xl shadow-md hover:scale-105 transition-transform"
                        >
                          Usar este Modelo
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col px-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-neutral-800 truncate group-hover:text-purple-700 transition-colors">
                          {tpl.name}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                          {tpl.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                        {tpl.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TELA DE MODELOS */}
        {currentView === 'templates' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10 max-w-7xl mx-auto w-full flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 pb-6">
              <div>
                <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
                  Modelos de Carrossel
                </h1>
                <p className="text-xs text-neutral-500 mt-1 max-w-xl">
                  Escolha uma estrutura profissional pronta para acelerar seu conteúdo ou salve seus próprios designs como modelos exclusivos.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => saveCurrentAsTemplate()}
                  className="bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center gap-2"
                  title="Salva os slides atuais como um modelo personalizado"
                >
                  <Bookmark className="w-3.5 h-3.5 text-purple-600" />
                  <span>Salvar Atual como Modelo</span>
                </button>

                <button
                  type="button"
                  onClick={createNewBlankCarousel}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-purple-600/20 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Criar do Zero</span>
                </button>
              </div>
            </div>

            {/* FILTROS DE CATEGORIA */}
            <div className="flex items-center gap-2 flex-wrap">
              {['Todos', 'Meus Modelos', 'Editorial', 'Vendas & Engajamento', 'Negócios', 'Minimalista', 'Criatividade'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setTemplateCategoryFilter(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    templateCategoryFilter === cat
                      ? 'bg-neutral-900 text-white border border-neutral-900 shadow-sm'
                      : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* GRID DE MODELOS */}
            {allTemplatesFiltered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-neutral-200/80">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                  <Bookmark className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-neutral-800">
                  Nenhum modelo encontrado em "{templateCategoryFilter}"
                </h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm">
                  {templateCategoryFilter === 'Meus Modelos'
                    ? 'Você ainda não salvou nenhum modelo próprio. Crie ou edite um carrossel e clique em "Salvar Atual como Modelo" para vê-lo aqui!'
                    : 'Não há modelos disponíveis nesta categoria no momento.'}
                </p>
                {templateCategoryFilter === 'Meus Modelos' && (
                  <button
                    type="button"
                    onClick={() => saveCurrentAsTemplate()}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Salvar Modelo Agora</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {allTemplatesFiltered.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl)}
                  className="group flex flex-col gap-2.5 cursor-pointer bg-white rounded-2xl p-3 border border-neutral-200 hover:border-purple-500 hover:shadow-lg transition-all"
                >
                  <div className="w-full aspect-[4/3] bg-neutral-100/90 rounded-xl p-2.5 flex items-center justify-center relative overflow-hidden">
                    <div className="w-[105px] h-[130px]">
                      <SlideThumbnail
                        slide={tpl.slides[0]}
                        username={username || "@usuário"}
                        avatarUrl={avatarUrl}
                        showHeader={true}
                      />
                    </div>

                    <div className="absolute inset-0 z-30 bg-neutral-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3">
                      <button
                        type="button"
                        className="bg-white text-purple-700 font-bold text-xs px-4 py-2 rounded-xl shadow-md hover:scale-105 transition-transform"
                      >
                        Usar Modelo
                      </button>
                      {tpl.isCustom && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCustomTemplate(tpl.id);
                          }}
                          className="bg-white hover:bg-red-50 text-red-600 p-2 rounded-xl shadow-md hover:scale-105 transition-transform"
                          title="Excluir este modelo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col px-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-neutral-800 truncate group-hover:text-purple-700 transition-colors">
                        {tpl.name}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded shrink-0">
                        {tpl.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                      {tpl.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        )}
      </div>
    );
  }

  // MODO EDITOR
  return (
    <div className="flex h-screen w-full bg-neutral-100 font-sans text-neutral-900 overflow-hidden">
      
      {/* SIDEBAR - NAVEGAÇÃO PRINCIPAL */}
      <aside className="w-20 bg-white border-r border-neutral-200 flex flex-col items-center py-6 gap-2 z-20 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <button 
          onClick={() => setActiveStep('colors')}
          className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${activeStep === 'colors' ? 'bg-neutral-100 text-blue-600' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'}`}
        >
          <Palette className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Cores</span>
        </button>
        <button 
          onClick={() => setActiveStep('elements')}
          className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${activeStep === 'elements' ? 'bg-neutral-100 text-blue-600' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'}`}
        >
          <Layers className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Elementos</span>
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
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#f3f4f7]">
        
        {/* TOPBAR DO EDITOR COM BOTÃO VOLTAR PARA INÍCIO / MODELOS */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            {/* PILLS RÁPIDAS NO TOPO DO EDITOR */}
            <div className="flex items-center gap-1.5 border border-neutral-200 p-1 rounded-full bg-neutral-50 shrink-0">
              <button
                type="button"
                onClick={() => {
                  savePostLocally();
                  setCurrentView('home');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-neutral-700 hover:bg-white hover:shadow-xs transition-all"
                title="Voltar para tela de início com histórico"
              >
                <HomeIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Início</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  savePostLocally();
                  setCurrentView('templates');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-600 hover:bg-white hover:shadow-xs transition-all"
                title="Ver modelos de carrossel"
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Modelos</span>
              </button>
            </div>

            <div className="w-[1px] h-6 bg-neutral-200 shrink-0" />

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 group">
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Nome do conteúdo"
                  title="Clique para definir o nome do conteúdo"
                  className="font-bold text-base text-neutral-800 placeholder:text-neutral-400 placeholder:font-normal bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-blue-500 focus:bg-neutral-50 rounded px-1.5 py-0.5 -ml-1.5 focus:outline-none transition-all w-48 sm:w-64"
                />
                <Edit2 className="w-3.5 h-3.5 text-neutral-400 opacity-40 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
              <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest px-0.5">Editorial Social</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Indicador de Nuvem no Editor (Clicável para sincronizar) */}
            <button 
              type="button"
              onClick={handleManualCloudSync}
              disabled={isSyncing}
              className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all border ${
                isSupabaseConfigured 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer active:scale-95' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              } ${isSyncing ? 'opacity-75 animate-pulse' : ''}`}
              title={
                isSupabaseConfigured 
                  ? 'Nuvem Supabase ativa: clique para sincronizar agora.' 
                  : 'Modo local: salvo apenas neste dispositivo.'
              }
            >
              {isSupabaseConfigured ? (
                <>
                  <Cloud className={`w-3 h-3 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Sincronizando...' : 'Nuvem'}</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3 h-3 text-amber-600" />
                  <span>Local</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => saveCurrentAsTemplate()}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 border border-neutral-200 px-3 py-2 rounded-lg transition-all"
              title="Salvar como um novo modelo na biblioteca"
            >
              <Bookmark className="w-3.5 h-3.5 text-purple-600" />
              <span>Salvar Modelo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                savePostLocally();
                alert(currentPostId ? "Alterações salvas no mesmo conteúdo com sucesso!" : "Conteúdo salvo no histórico!");
              }}
              className="text-xs font-semibold text-neutral-700 hover:bg-neutral-100 border border-neutral-200 px-3 py-2 rounded-lg transition-all"
              title="Salvar alterações no mesmo conteúdo existente"
            >
              Salvar
            </button>

            <button
              type="button"
              onClick={() => {
                const name = prompt("Nome para a nova cópia:", `${projectName || 'Carrossel'} (Novo)`);
                if (name === null) return;
                savePostLocally(name.trim() || undefined, true);
                alert("Novo conteúdo salvo no histórico com sucesso!");
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-lg transition-all"
              title="Criar um novo conteúdo separado no histórico a partir deste"
            >
              <Copy className="w-3.5 h-3.5 text-blue-600" />
              <span>Salvar como Novo</span>
            </button>

            <span className="text-sm font-medium text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-full">{slides.length}/10 Slides</span>
            <button 
              onClick={exportCarousel}
              className="bg-black hover:bg-neutral-800 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              Exportar Design
            </button>
          </div>
        </header>

        {/* BARRA DE FORMATAÇÃO DE TEXTO CONTEXTUAL (ESTILO CANVA) */}
        <div className="h-12 bg-white border-b border-neutral-200 px-6 flex items-center justify-between shrink-0 z-40 shadow-xs gap-3 select-none relative overflow-visible">
          {/* BACKDROP PARA FECHAR POPOVERS AO CLICAR FORA */}
          {(isFontDropdownOpen || isColorPickerOpen || isSpacingOpen || isPositionOpen) && (
            <div 
              className="fixed inset-0 z-40 cursor-default" 
              onClick={() => {
                setIsFontDropdownOpen(false);
                setIsColorPickerOpen(false);
                setIsSpacingOpen(false);
                setIsPositionOpen(false);
              }} 
            />
          )}

          <div className="flex items-center gap-2 py-1 overflow-visible">
            
            {/* 1. SELETOR RÁPIDO DO ELEMENTO (Contexto / Destaque / Conclusão) */}
            <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/80 shrink-0">
              {currentSlide.blocks.map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setFocusedBlockId(b.id)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                    currentBlock?.id === b.id 
                      ? 'bg-white text-blue-600 shadow-xs' 
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  {b.type === 'prefix' ? 'Contexto' : b.type === 'highlight' ? 'Destaque' : 'Conclusão'}
                </button>
              ))}
            </div>

            <div className="h-4 w-[1px] bg-neutral-200 shrink-0 mx-1" />

            {/* 2. SELETOR DE FONTE (Dropdown estilo Canva) */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsFontDropdownOpen(!isFontDropdownOpen);
                  setIsColorPickerOpen(false);
                  setIsSpacingOpen(false);
                  setIsPositionOpen(false);
                }}
                className="h-8 px-2.5 rounded-lg border border-neutral-200 hover:border-neutral-300 bg-white flex items-center justify-between gap-2 text-xs font-semibold text-neutral-800 transition-colors min-w-[125px]"
                title="Fonte do texto"
              >
                <span className="truncate" style={{ fontFamily: currentBlock?.fontFamily || "'Inter', sans-serif" }}>
                  {AVAILABLE_FONTS.find(f => f.value === currentBlock?.fontFamily)?.name || 'Inter'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              </button>

              {isFontDropdownOpen && (
                <div className="absolute top-10 left-0 w-48 bg-white border border-neutral-200 rounded-xl shadow-xl py-1 z-50 flex flex-col max-h-60 overflow-y-auto custom-scrollbar">
                  {AVAILABLE_FONTS.map(f => {
                    const isSelected = currentBlock?.fontFamily ? currentBlock.fontFamily === f.value : f.name === 'Inter';
                    return (
                      <button
                        key={f.name}
                        type="button"
                        onClick={() => {
                          if (currentBlock) updateBlockProperty(currentSlide.id, currentBlock.id, { fontFamily: f.value });
                          setIsFontDropdownOpen(false);
                        }}
                        style={{ fontFamily: f.value }}
                        className={`px-3 py-2 text-left text-sm hover:bg-neutral-100 flex items-center justify-between transition-colors ${
                          isSelected 
                            ? 'text-blue-600 bg-blue-50/50 font-bold' 
                            : 'text-neutral-700'
                        }`}
                      >
                        <span>{f.name}</span>
                        {isSelected && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. TAMANHO DA FONTE (- 48 +) */}
            <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-white shrink-0 h-8">
              <button
                type="button"
                onClick={() => {
                  if (currentBlock) {
                    const newScale = Math.max(0.4, (currentBlock.scale || 1) - 0.05);
                    updateBlockProperty(currentSlide.id, currentBlock.id, { scale: Number(newScale.toFixed(2)) });
                  }
                }}
                title="Diminuir tamanho"
                className="w-7 h-full flex items-center justify-center hover:bg-neutral-100 text-neutral-600 active:bg-neutral-200 transition-colors border-r border-neutral-200"
              >
                <Minus className="w-3 h-3" />
              </button>

              <span className="w-10 text-center text-xs font-semibold text-neutral-800">
                {Math.round((currentBlock?.scale || 1) * (currentBlock?.type === 'highlight' ? 78 : 24))}
              </span>

              <button
                type="button"
                onClick={() => {
                  if (currentBlock) {
                    const newScale = Math.min(2.5, (currentBlock.scale || 1) + 0.05);
                    updateBlockProperty(currentSlide.id, currentBlock.id, { scale: Number(newScale.toFixed(2)) });
                  }
                }}
                title="Aumentar tamanho"
                className="w-7 h-full flex items-center justify-center hover:bg-neutral-100 text-neutral-600 active:bg-neutral-200 transition-colors border-l border-neutral-200"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* 4. COR DO TEXTO (A com barra colorida) */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsColorPickerOpen(!isColorPickerOpen);
                  setIsFontDropdownOpen(false);
                  setIsSpacingOpen(false);
                  setIsPositionOpen(false);
                }}
                title="Cor do texto"
                className={`w-8 h-8 rounded-lg flex flex-col items-center justify-center border transition-all ${
                  isColorPickerOpen 
                    ? 'border-blue-500 bg-blue-50/50' 
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <span className="text-xs font-black leading-none text-neutral-800">A</span>
                <div 
                  className="w-4 h-1 rounded-full mt-0.5 shadow-xs" 
                  style={{ backgroundColor: currentBlock?.customColor || (currentBlock?.type === 'highlight' ? currentSlide.palette.highlightColor : currentSlide.palette.textColor) }} 
                />
              </button>

              {isColorPickerOpen && (
                <div className="absolute top-10 left-0 w-60 bg-white border border-neutral-200 rounded-xl shadow-xl p-3 z-50 flex flex-col gap-2.5">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Cores da Paleta</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { label: 'Fundo', color: currentSlide.palette.bgColor },
                      { label: 'Texto', color: currentSlide.palette.textColor },
                      { label: 'Destaque', color: currentSlide.palette.highlightColor },
                      { label: 'Secundária', color: currentSlide.palette.secondaryTextColor },
                    ].map(c => (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => {
                          if (currentBlock) updateBlockProperty(currentSlide.id, currentBlock.id, { customColor: c.color });
                          setIsColorPickerOpen(false);
                        }}
                        title={`${c.label} (${c.color})`}
                        className="w-11 h-9 rounded-lg border border-neutral-300 hover:scale-105 transition-transform flex items-center justify-center shadow-xs"
                        style={{ backgroundColor: c.color }}
                      >
                        {(currentBlock?.customColor === c.color || (!currentBlock?.customColor && ((currentBlock?.type === 'highlight' && c.label === 'Destaque') || (currentBlock?.type !== 'highlight' && c.label === 'Texto')))) && (
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        )}
                      </button>
                    ))}
                  </div>

                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider pt-1 border-t border-neutral-100">Cores Padrão</span>
                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (currentBlock) updateBlockProperty(currentSlide.id, currentBlock.id, { customColor: '#FFFFFF' });
                        setIsColorPickerOpen(false);
                      }}
                      className="w-8 h-8 rounded-lg border border-neutral-300 bg-white hover:scale-105 transition-transform flex items-center justify-center shadow-xs"
                      title="Branco"
                    >
                      {currentBlock?.customColor === '#FFFFFF' && <Check className="w-3.5 h-3.5 text-neutral-900" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (currentBlock) updateBlockProperty(currentSlide.id, currentBlock.id, { customColor: '#000000' });
                        setIsColorPickerOpen(false);
                      }}
                      className="w-8 h-8 rounded-lg border border-neutral-300 bg-black hover:scale-105 transition-transform flex items-center justify-center shadow-xs"
                      title="Preto"
                    >
                      {currentBlock?.customColor === '#000000' && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>

                    <label className="relative w-8 h-8 rounded-lg overflow-hidden border border-neutral-300 hover:scale-105 transition-transform cursor-pointer flex items-center justify-center bg-gradient-to-tr from-rose-500 via-emerald-500 to-sky-500 shadow-xs" title="Escolher cor personalizada">
                      <input 
                        type="color" 
                        value={currentBlock?.customColor || '#000000'} 
                        onChange={(e) => {
                          if (currentBlock) updateBlockProperty(currentSlide.id, currentBlock.id, { customColor: e.target.value });
                        }} 
                        className="opacity-0 absolute inset-0 cursor-pointer w-full h-full" 
                      />
                    </label>

                    {currentBlock?.customColor && (
                      <button
                        type="button"
                        onClick={() => {
                          if (currentBlock) updateBlockProperty(currentSlide.id, currentBlock.id, { customColor: undefined });
                          setIsColorPickerOpen(false);
                        }}
                        className="text-[10px] text-neutral-500 hover:text-red-600 underline ml-auto"
                      >
                        Restaurar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 5. NEGRITO (B) */}
            <button
              type="button"
              onClick={() => {
                if (currentBlock) {
                  const isBold = currentBlock.isBold !== undefined ? currentBlock.isBold : (currentBlock.type === 'highlight');
                  updateBlockProperty(currentSlide.id, currentBlock.id, { isBold: !isBold });
                }
              }}
              title="Negrito"
              className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm border transition-all shrink-0 ${
                (currentBlock?.isBold !== undefined ? currentBlock.isBold : (currentBlock?.type === 'highlight'))
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <Bold className="w-4 h-4" />
            </button>

            {/* 6. ITÁLICO (I) */}
            <button
              type="button"
              onClick={() => {
                if (currentBlock) updateBlockProperty(currentSlide.id, currentBlock.id, { isItalic: !currentBlock.isItalic });
              }}
              title="Itálico"
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-all shrink-0 ${
                currentBlock?.isItalic
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <Italic className="w-4 h-4" />
            </button>

            {/* 7. SUBLINHADO (U) */}
            <button
              type="button"
              onClick={() => {
                if (currentBlock) updateBlockProperty(currentSlide.id, currentBlock.id, { isUnderline: !currentBlock.isUnderline });
              }}
              title="Sublinhado"
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-all shrink-0 ${
                currentBlock?.isUnderline
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <Underline className="w-4 h-4" />
            </button>

            {/* 8. TACHADO (S) */}
            <button
              type="button"
              onClick={() => {
                if (currentBlock) updateBlockProperty(currentSlide.id, currentBlock.id, { isStrike: !currentBlock.isStrike });
              }}
              title="Tachado"
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-all shrink-0 ${
                currentBlock?.isStrike
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <Strikethrough className="w-4 h-4" />
            </button>

            {/* 9. CAIXA ALTA (aA) */}
            <button
              type="button"
              onClick={() => {
                if (currentBlock) {
                  const isUpper = currentBlock.uppercase !== undefined ? currentBlock.uppercase : (currentBlock.type === 'highlight');
                  updateBlockProperty(currentSlide.id, currentBlock.id, { uppercase: !isUpper });
                }
              }}
              title="Alternar Maiúsculas / Minúsculas"
              className={`px-2 h-8 rounded-lg flex items-center justify-center text-xs font-bold border transition-all shrink-0 ${
                (currentBlock?.uppercase !== undefined ? currentBlock.uppercase : (currentBlock?.type === 'highlight'))
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300'
              }`}
            >
              aA
            </button>

            <div className="h-4 w-[1px] bg-neutral-200 shrink-0 mx-1" />

            {/* 10. ALINHAMENTO */}
            <button
              type="button"
              onClick={() => {
                if (currentBlock) {
                  const aligns: ('left' | 'center' | 'right' | 'justify')[] = ['left', 'center', 'right', 'justify'];
                  const currentIdx = aligns.indexOf(currentBlock.align || 'left');
                  const nextAlign = aligns[(currentIdx + 1) % aligns.length];
                  updateBlockProperty(currentSlide.id, currentBlock.id, { align: nextAlign });
                }
              }}
              title={`Alinhamento (Atual: ${currentBlock?.align || 'esquerda'})`}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-700 border border-neutral-200 hover:border-neutral-300 bg-white transition-all shrink-0 shadow-xs"
            >
              {currentBlock?.align === 'center' ? (
                <AlignCenter className="w-4 h-4 text-blue-600" />
              ) : currentBlock?.align === 'right' ? (
                <AlignRight className="w-4 h-4 text-blue-600" />
              ) : currentBlock?.align === 'justify' ? (
                <AlignJustify className="w-4 h-4 text-blue-600" />
              ) : (
                <AlignLeft className="w-4 h-4 text-blue-600" />
              )}
            </button>

            {/* 11. ESPAÇAMENTO (↤T↦) */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsSpacingOpen(!isSpacingOpen);
                  setIsFontDropdownOpen(false);
                  setIsColorPickerOpen(false);
                  setIsPositionOpen(false);
                }}
                title="Espaçamento entre letras e linhas"
                className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                  isSpacingOpen 
                    ? 'border-blue-500 bg-blue-50/50 text-blue-600' 
                    : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {isSpacingOpen && (
                <div className="absolute top-10 left-0 w-64 bg-white border border-neutral-200 rounded-xl shadow-xl p-4 z-50 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-neutral-700">Espaço entre letras</span>
                      <span className="font-mono text-neutral-500">{currentBlock?.letterSpacing || 0}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="-2" 
                      max="12" 
                      step="1"
                      value={currentBlock?.letterSpacing || 0} 
                      onChange={(e) => {
                        if (currentBlock) updateBlockProperty(currentSlide.id, currentBlock.id, { letterSpacing: parseInt(e.target.value) });
                      }}
                      className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-neutral-700">Altura da linha</span>
                      <span className="font-mono text-neutral-500">{currentBlock?.lineHeight || (currentBlock?.type === 'highlight' ? 0.85 : 1.2)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0.7" 
                      max="2.0" 
                      step="0.05"
                      value={currentBlock?.lineHeight || (currentBlock?.type === 'highlight' ? 0.85 : 1.2)} 
                      onChange={(e) => {
                        if (currentBlock) updateBlockProperty(currentSlide.id, currentBlock.id, { lineHeight: parseFloat(e.target.value) });
                      }}
                      className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 12. POSIÇÃO (Posição ▾) */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsPositionOpen(!isPositionOpen);
                  setIsFontDropdownOpen(false);
                  setIsColorPickerOpen(false);
                  setIsSpacingOpen(false);
                }}
                title="Posição vertical do texto"
                className={`h-8 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isPositionOpen 
                    ? 'border-blue-500 bg-blue-50/50 text-blue-600' 
                    : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-700'
                }`}
              >
                <span>Posição</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {isPositionOpen && (
                <div className="absolute top-10 right-0 w-44 bg-white border border-neutral-200 rounded-xl shadow-xl py-1 z-50 flex flex-col">
                  <button
                    type="button"
                    onClick={() => {
                      updateSlideContentOffsetY(currentSlide.id, -35);
                      setIsPositionOpen(false);
                    }}
                    className="px-3 py-2 text-left text-xs font-semibold hover:bg-neutral-100 text-neutral-700 flex items-center justify-between"
                  >
                    <span>Mais ao Topo</span>
                    <span className="text-[10px] text-neutral-400">Topo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateSlideContentOffsetY(currentSlide.id, 0);
                      setIsPositionOpen(false);
                    }}
                    className="px-3 py-2 text-left text-xs font-semibold hover:bg-neutral-100 text-neutral-700 flex items-center justify-between bg-blue-50/50 text-blue-700"
                  >
                    <span>Centralizado (Padrão)</span>
                    {(!currentSlide.contentOffsetY || currentSlide.contentOffsetY === 0) && (
                      <Check className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      updateSlideContentOffsetY(currentSlide.id, 35);
                      setIsPositionOpen(false);
                    }}
                    className="px-3 py-2 text-left text-xs font-semibold hover:bg-neutral-100 text-neutral-700 flex items-center justify-between"
                  >
                    <span>Mais ao Rodapé</span>
                    <span className="text-[10px] text-neutral-400">Rodapé</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Dica de foco no canto direito */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-neutral-400 shrink-0">
            <span>Editando:</span>
            <span className="font-bold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200/60">
              Slide {slides.findIndex(s => s.id === currentSlide.id) + 1} • {currentBlock?.type === 'prefix' ? 'Contexto' : currentBlock?.type === 'highlight' ? 'Destaque' : 'Conclusão'}
            </span>
          </div>
        </div>

        {/* WORKSPACE (CANVAS) */}
        <div className="flex-1 min-h-0 overflow-auto p-8 custom-scrollbar flex relative">
          
          {/* ZOOM CONTROLS */}
          <div className="fixed bottom-8 right-8 bg-white text-neutral-800 shadow-xl rounded-full border border-neutral-200 flex items-center p-1.5 z-50">
            <button onClick={() => setCanvasZoom(z => Math.max(0.3, z - 0.1))} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><Minus className="w-4 h-4" /></button>
            <span className="text-xs font-semibold w-14 text-center">{Math.round(canvasZoom * 100)}%</span>
            <button onClick={() => setCanvasZoom(z => Math.min(2, z + 0.1))} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><Plus className="w-4 h-4" /></button>
          </div>

          <div className="m-auto min-w-fit min-h-max flex items-center justify-center p-8">
            
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
                      : `rounded-[32px] shadow-2xl cursor-pointer ${activeSlideId === slide.id ? 'ring-4 ring-blue-500 ring-offset-4 ring-offset-[#f3f4f7]' : 'hover:ring-2 hover:ring-black/10'}`
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

                    {/* INSTAGRAM HEADER MOCKUP (Apenas no primeiro slide e layout padrão) */}
                    {index === 0 && showHeader && slide.layout !== 'cards-showcase' && (
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

                    {/* CONTAINER COESO DE TEXTOS OU VITRINE DE CARDS */}
                    {slide.layout === 'cards-showcase' ? (
                      /* LAYOUT VITRINE DE 3 CARDS / FOTOS (IGUAL AO PRINT DE REFERÊNCIA) */
                      <div className="absolute inset-0 flex flex-col justify-between p-7 pt-9 pb-6 pointer-events-auto select-none overflow-hidden">
                        {/* Textura sutil de papel linho editorial */}
                        <div 
                          className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply" 
                          style={{
                            backgroundImage: `radial-gradient(#b8b3a7 0.8px, transparent 0.8px)`,
                            backgroundSize: '9px 9px'
                          }}
                        />

                        {/* BLOCO SUPERIOR: TÍTULOS (Posts criativos / que quase ninguém faz) COM SUPORTE A ARRASTO E CAIXA ALTA */}
                        <div 
                          className="group/text-group relative flex flex-col items-center text-center gap-1.5 z-10 w-full px-2 mt-1 pointer-events-auto"
                          style={{
                            transform: `translateY(${slide.contentOffsetY || 0}px)`,
                            transition: draggingGroupSlideId === slide.id ? 'none' : 'transform 0.15s ease-out'
                          }}
                        >
                          {/* Alça de arrasto vertical dos títulos */}
                          {!isExporting && (
                            <div 
                              className="export-ignore absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/text-group:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1.5 hover:bg-black/10 rounded-lg z-30 shadow-xs bg-white/90 backdrop-blur-xs"
                              title="Arrastar títulos verticalmente"
                              onMouseDown={(e) => handleGroupDragStart(slide.id, slide.contentOffsetY || 0, e)}
                            >
                              <GripVertical className="w-4 h-4" style={{ color: slide.palette.textColor, opacity: 0.7 }} />
                            </div>
                          )}

                          {/* Bloco Highlight (ex: Posts criativos) */}
                          {(() => {
                            const block = slide.blocks.find(b => b.type === 'highlight');
                            if (!block) return null;
                            const isEditing = editingBlockId === block.id;
                            const isFocused = focusedBlockId === block.id;
                            const isUpper = block.uppercase !== undefined ? block.uppercase : (block.type === 'highlight');
                            const upperClass = isUpper ? 'uppercase' : 'normal-case';
                            const fontFamily = block.fontFamily || "'Inter', sans-serif";
                            const textColor = block.customColor || slide.palette.highlightColor;
                            const isBold = block.isBold !== undefined ? block.isBold : true;
                            const fontWeight = isBold ? 900 : 400;
                            const fontStyle = block.isItalic ? 'italic' : 'normal';
                            const textDecoration = [block.isUnderline ? 'underline' : '', block.isStrike ? 'line-through' : ''].filter(Boolean).join(' ') || 'none';
                            const letterSpacing = block.letterSpacing !== undefined ? `${block.letterSpacing}px` : '-0.04em';
                            const lineHeight = block.lineHeight !== undefined ? block.lineHeight : 0.88;
                            const textAlign = block.align || 'center';
                            const fontSize = (block.scale || 1) * 44;

                            const blockStyle: React.CSSProperties = {
                              color: textColor,
                              fontFamily,
                              fontWeight,
                              fontStyle,
                              textDecoration,
                              letterSpacing,
                              lineHeight,
                              textAlign,
                              textTransform: isUpper ? 'uppercase' : 'none',
                            };

                            return (
                              <div 
                                key={block.id}
                                onMouseDown={(e) => { 
                                  setFocusedBlockId(block.id); 
                                  setActiveSlideId(slide.id); 
                                  if (!isEditing) {
                                    handleFlexibleDragStart(slide.id, slide.contentOffsetY || 0, e);
                                  }
                                }}
                                onDoubleClick={(e) => { 
                                  e.stopPropagation(); 
                                  setEditingBlockId(block.id); 
                                  setFocusedBlockId(block.id); 
                                  setActiveSlideId(slide.id); 
                                }}
                                className="w-full relative group/h"
                              >
                                {isEditing ? (
                                  <textarea
                                    autoFocus
                                    value={block.text}
                                    onChange={(e) => updateBlockText(slide.id, block.id, e.target.value)}
                                    onBlur={() => setEditingBlockId(null)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Escape') setEditingBlockId(null);
                                    }}
                                    className={`w-full text-center bg-blue-500/10 border-2 border-dashed border-blue-500 rounded p-1 outline-none resize-none font-black tracking-tight ${upperClass}`}
                                    style={{ 
                                      ...blockStyle,
                                      fontSize: `${fontSize}px` 
                                    }}
                                  />
                                ) : (
                                  <h2 
                                    className={`whitespace-pre-wrap cursor-pointer hover:outline-dashed hover:outline-1 hover:outline-black/20 rounded px-2 py-0.5 select-none ${upperClass}`}
                                    style={{ 
                                      ...blockStyle,
                                      fontSize: `${fontSize}px`,
                                      boxShadow: (!isExporting && isFocused) ? `0 0 0 2px ${textColor}60` : 'none',
                                      backgroundColor: (!isExporting && isFocused) ? `${textColor}08` : 'transparent'
                                    }}
                                  >
                                    {block.text}
                                  </h2>
                                )}
                              </div>
                            );
                          })()}

                          {/* Bloco Suffix (ex: que quase ninguém faz) */}
                          {(() => {
                            const block = slide.blocks.find(b => b.type === 'suffix');
                            if (!block) return null;
                            const isEditing = editingBlockId === block.id;
                            const isFocused = focusedBlockId === block.id;
                            const isUpper = block.uppercase !== undefined ? block.uppercase : false;
                            const upperClass = isUpper ? 'uppercase' : 'normal-case';
                            const fontFamily = block.fontFamily || "'Inter', sans-serif";
                            const textColor = block.customColor || slide.palette.textColor;
                            const isBold = block.isBold !== undefined ? block.isBold : true;
                            const fontWeight = isBold ? 700 : 400;
                            const fontStyle = block.isItalic ? 'italic' : 'normal';
                            const textDecoration = [block.isUnderline ? 'underline' : '', block.isStrike ? 'line-through' : ''].filter(Boolean).join(' ') || 'none';
                            const letterSpacing = block.letterSpacing !== undefined ? `${block.letterSpacing}px` : 'normal';
                            const lineHeight = block.lineHeight !== undefined ? block.lineHeight : 1.15;
                            const textAlign = block.align || 'center';
                            const fontSize = (block.scale || 1) * 19;

                            const blockStyle: React.CSSProperties = {
                              color: textColor,
                              fontFamily,
                              fontWeight,
                              fontStyle,
                              textDecoration,
                              letterSpacing,
                              lineHeight,
                              textAlign,
                              textTransform: isUpper ? 'uppercase' : 'none',
                            };

                            return (
                              <div 
                                key={block.id}
                                onMouseDown={(e) => { 
                                  setFocusedBlockId(block.id); 
                                  setActiveSlideId(slide.id); 
                                  if (!isEditing) {
                                    handleFlexibleDragStart(slide.id, slide.contentOffsetY || 0, e);
                                  }
                                }}
                                onDoubleClick={(e) => { 
                                  e.stopPropagation(); 
                                  setEditingBlockId(block.id); 
                                  setFocusedBlockId(block.id); 
                                  setActiveSlideId(slide.id); 
                                }}
                                className="w-full relative group/s"
                              >
                                {isEditing ? (
                                  <textarea
                                    autoFocus
                                    value={block.text}
                                    onChange={(e) => updateBlockText(slide.id, block.id, e.target.value)}
                                    onBlur={() => setEditingBlockId(null)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Escape') setEditingBlockId(null);
                                    }}
                                    className={`w-full text-center bg-blue-500/10 border-2 border-dashed border-blue-500 rounded p-1 outline-none resize-none tracking-tight ${upperClass}`}
                                    style={{ 
                                      ...blockStyle,
                                      fontSize: `${fontSize}px` 
                                    }}
                                  />
                                ) : (
                                  <p 
                                    className={`tracking-tight cursor-pointer hover:outline-dashed hover:outline-1 hover:outline-black/20 rounded px-2 py-0.5 select-none ${upperClass}`}
                                    style={{ 
                                      ...blockStyle,
                                      fontSize: `${fontSize}px`,
                                      boxShadow: (!isExporting && isFocused) ? `0 0 0 2px ${textColor}60` : 'none',
                                      backgroundColor: (!isExporting && isFocused) ? `${textColor}08` : 'transparent'
                                    }}
                                  >
                                    {block.text}
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                        </div>

                        {/* BLOCO CENTRAL: LEQUE DE 3 FOTOS / CARDS */}
                        <div className="relative w-full h-[230px] flex items-center justify-center my-auto z-10">
                          {/* Card 1: Esquerda (-7 graus) */}
                          <div 
                            className="absolute w-[112px] h-[162px] -translate-x-14 translate-y-3.5 -rotate-6 rounded-2xl overflow-hidden shadow-xl shadow-black/15 border border-white/60 bg-neutral-100 group/c1 cursor-pointer transition-transform hover:scale-105"
                            title="Clique para trocar esta foto"
                            onClick={() => {
                              cardInputRefs.current[`${slide.id}-0`]?.click();
                            }}
                          >
                            <img 
                              src={slide.cardImages?.[0] || DEFAULT_SHOWCASE_IMAGES[0]} 
                              alt="Card Esquerdo" 
                              className="w-full h-full object-cover" 
                              crossOrigin="anonymous"
                            />
                            <input 
                              type="file" 
                              ref={(el) => { if (el) cardInputRefs.current[`${slide.id}-0`] = el; }}
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    if (ev.target?.result) updateSlideCardImage(slide.id, 0, ev.target.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} 
                            />
                            {!isExporting && (
                              <div className="export-ignore absolute inset-0 bg-black/40 opacity-0 group-hover/c1:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 p-1 text-center">
                                <Camera className="w-5 h-5 drop-shadow" />
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-black/50 px-2 py-0.5 rounded-full">Trocar Foto</span>
                              </div>
                            )}
                          </div>

                          {/* Card 3: Direita (+7 graus) */}
                          <div 
                            className="absolute w-[112px] h-[162px] translate-x-14 translate-y-3.5 rotate-6 rounded-2xl overflow-hidden shadow-xl shadow-black/15 border border-white/60 bg-neutral-100 group/c3 cursor-pointer transition-transform hover:scale-105"
                            title="Clique para trocar esta foto"
                            onClick={() => {
                              cardInputRefs.current[`${slide.id}-2`]?.click();
                            }}
                          >
                            <img 
                              src={slide.cardImages?.[2] || DEFAULT_SHOWCASE_IMAGES[2]} 
                              alt="Card Direito" 
                              className="w-full h-full object-cover" 
                              crossOrigin="anonymous"
                            />
                            <input 
                              type="file" 
                              ref={(el) => { if (el) cardInputRefs.current[`${slide.id}-2`] = el; }}
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    if (ev.target?.result) updateSlideCardImage(slide.id, 2, ev.target.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} 
                            />
                            {!isExporting && (
                              <div className="export-ignore absolute inset-0 bg-black/40 opacity-0 group-hover/c3:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 p-1 text-center">
                                <Camera className="w-5 h-5 drop-shadow" />
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-black/50 px-2 py-0.5 rounded-full">Trocar Foto</span>
                              </div>
                            )}
                          </div>

                          {/* Card 2: Centro (Destaque Principal Elevado) */}
                          <div 
                            className="absolute w-[124px] h-[180px] -translate-y-1.5 z-20 scale-105 rounded-2xl overflow-hidden shadow-2xl shadow-black/25 border-2 border-white bg-neutral-900 group/c2 cursor-pointer transition-transform hover:scale-110"
                            title="Clique para trocar esta foto"
                            onClick={() => {
                              cardInputRefs.current[`${slide.id}-1`]?.click();
                            }}
                          >
                            <img 
                              src={slide.cardImages?.[1] || DEFAULT_SHOWCASE_IMAGES[1]} 
                              alt="Card Central" 
                              className="w-full h-full object-cover" 
                              crossOrigin="anonymous"
                            />
                            <input 
                              type="file" 
                              ref={(el) => { if (el) cardInputRefs.current[`${slide.id}-1`] = el; }}
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    if (ev.target?.result) updateSlideCardImage(slide.id, 1, ev.target.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} 
                            />
                            {!isExporting && (
                              <div className="export-ignore absolute inset-0 bg-black/40 opacity-0 group-hover/c2:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 p-1 text-center">
                                <Camera className="w-6 h-6 drop-shadow" />
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-black/50 px-2 py-0.5 rounded-full">Trocar Foto</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* BLOCO INFERIOR: RODAPÉ COM @ E SETA */}
                        <div className="flex items-center justify-between px-2 pt-1 z-10 w-full" style={{ color: slide.palette.textColor }}>
                          <span className="text-xs font-bold tracking-tight">
                            {username.startsWith('@') ? username : `@${username}`}
                          </span>
                          <div className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors">
                            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* CONTAINER COESO DE TEXTOS (AUTO-LAYOUT INTELIGENTE) */
                      <div 
                        className="group/text-group absolute left-10 w-[320px] top-[75px] h-[350px] flex flex-col justify-center pointer-events-auto"
                      style={{
                        transform: `translateY(${slide.contentOffsetY || 0}px)`,
                        transition: draggingGroupSlideId === slide.id ? 'none' : 'transform 0.15s ease-out'
                      }}
                    >
                      {/* Alça de arrasto do grupo todo verticalmente */}
                      {!isExporting && (
                        <div 
                          className="export-ignore absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover/text-group:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 hover:bg-black/5 rounded z-20"
                          title="Arrastar conjunto de textos verticalmente"
                          onMouseDown={(e) => handleGroupDragStart(slide.id, slide.contentOffsetY || 0, e)}
                        >
                          <GripVertical className="w-4 h-4" style={{ color: slide.palette.textColor, opacity: 0.5 }} />
                        </div>
                      )}

                      {/* Pilha dos blocos com espaçamento proporcional inteligente */}
                      <div className="flex flex-col gap-3.5 w-full">
                        {[...slide.blocks]
                          .sort((a, b) => {
                            const order = { prefix: 1, highlight: 2, suffix: 3 };
                            return (order[a.type] || 2) - (order[b.type] || 2);
                          })
                          .map(block => {
                            const isEditing = editingBlockId === block.id;
                            let alignClass = block.align ? `text-${block.align}` : 'text-left';
                            const isUpper = block.uppercase !== undefined ? block.uppercase : (block.type === 'highlight');
                            const upperClass = isUpper ? 'uppercase' : 'normal-case';

                            const fontFamily = block.fontFamily || "'Inter', sans-serif";
                            const textColor = block.customColor || (block.type === 'highlight' ? slide.palette.highlightColor : slide.palette.textColor);
                            const isBold = block.isBold !== undefined ? block.isBold : (block.type === 'highlight');
                            const fontWeight = isBold ? (block.type === 'highlight' ? 900 : 700) : 400;
                            const fontStyle = block.isItalic ? 'italic' : 'normal';
                            const textDecoration = [block.isUnderline ? 'underline' : '', block.isStrike ? 'line-through' : ''].filter(Boolean).join(' ') || 'none';
                            const letterSpacing = block.letterSpacing !== undefined ? `${block.letterSpacing}px` : (block.type === 'highlight' ? '-0.04em' : 'normal');
                            const lineHeight = block.lineHeight !== undefined ? block.lineHeight : (block.type === 'highlight' ? 0.85 : 1.2);
                            const fontSizePx = (block.scale || 1) * (block.type === 'highlight' ? 78 : 20);

                            const blockStyle: React.CSSProperties = {
                              color: textColor,
                              fontFamily: fontFamily,
                              fontWeight: fontWeight,
                              fontStyle: fontStyle,
                              textDecoration: textDecoration,
                              letterSpacing: letterSpacing,
                              lineHeight: lineHeight,
                            };

                            let content = null;

                            if (isEditing) {
                              content = (
                                <div className={`w-full ${alignClass}`}>
                                  <textarea
                                    ref={(el) => {
                                      if (el) {
                                        el.style.height = 'auto';
                                        el.style.height = `${el.scrollHeight}px`;
                                      }
                                    }}
                                    autoFocus
                                    value={block.text}
                                    onChange={(e) => {
                                      updateBlockText(slide.id, block.id, e.target.value);
                                      e.target.style.height = 'auto';
                                      e.target.style.height = `${e.target.scrollHeight}px`;
                                    }}
                                    onBlur={() => setEditingBlockId(null)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Escape') {
                                        setEditingBlockId(null);
                                      }
                                    }}
                                    style={{
                                      ...blockStyle,
                                      fontSize: `${fontSizePx}px`,
                                      textAlign: block.align || 'left',
                                      textTransform: isUpper ? 'uppercase' : 'none',
                                    }}
                                    className="w-full bg-blue-500/10 border-2 border-dashed border-blue-500 rounded p-1 outline-none resize-none overflow-hidden select-text z-30"
                                  />
                                </div>
                              );
                            } else if (block.type === 'prefix') {
                              content = (
                                <div className={`w-full ${alignClass}`}>
                                  <span style={{ ...blockStyle, fontSize: `${fontSizePx}px` }} className={`tracking-tight break-words block ${upperClass}`}>
                                    {block.text}
                                  </span>
                                </div>
                              );
                            } else if (block.type === 'highlight') {
                              content = (
                                <div className={`w-full ${alignClass}`}>
                                  <h2 style={{ ...blockStyle, fontSize: `${fontSizePx}px` }} className={`whitespace-pre-wrap break-words block ${upperClass}`}>
                                    {block.text}
                                  </h2>
                                </div>
                              );
                            } else if (block.type === 'suffix') {
                              content = (
                                <div className={`w-full ${alignClass}`}>
                                  <p style={{ ...blockStyle, fontSize: `${fontSizePx}px` }} className={`tracking-tight break-words block ${upperClass}`}>
                                    {block.text}
                                  </p>
                                </div>
                              );
                            }

                            const isFocused = focusedBlockId === block.id;

                            return (
                              <div
                                key={block.id}
                                onMouseDown={(e) => {
                                  setFocusedBlockId(block.id);
                                  setActiveSlideId(slide.id);
                                  if (!isEditing) {
                                    handleFlexibleDragStart(slide.id, slide.contentOffsetY || 0, e);
                                  }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFocusedBlockId(block.id);
                                  setActiveSlideId(slide.id);
                                }}
                                onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  setEditingBlockId(block.id);
                                  setFocusedBlockId(block.id);
                                  setActiveSlideId(slide.id);
                                }}
                                className={`w-full rounded-md transition-all relative ${
                                  isEditing 
                                    ? 'cursor-text select-text' 
                                    : 'cursor-pointer select-none hover:outline-dashed hover:outline-1 hover:outline-black/20'
                                }`}
                                style={{ 
                                  boxShadow: (!isExporting && isFocused && !isEditing) ? `0 0 0 2px ${slide.palette.textColor}60` : 'none', 
                                  backgroundColor: (!isExporting && isFocused && !isEditing) ? `${slide.palette.textColor}08` : 'transparent' 
                                }}
                              >
                                {content}
                              </div>
                            );
                        })}
                      </div>
                    </div>
                  )}

                    {/* INSTAGRAM FOOTER MOCKUP (Apenas no primeiro slide e layout padrão) */}
                    {index === 0 && showFooter && slide.layout !== 'cards-showcase' && (
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
        ::-webkit-scrollbar-button { display: none !important; width: 0 !important; height: 0 !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a1a1aa; }
        .no-scrollbar::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
