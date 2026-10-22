import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useShopStore } from '../services/store';
import { INITIAL_CATEGORIES } from '../data/mockData';

interface CategoriesPageProps {
  onSelectCategory: (categoryId: string) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ onSelectCategory }) => {
  const store = useShopStore();
  const t = store.t();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t.allCategories}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Explore curated tech gadgets, lifestyle accessories, audio, and gaming gear.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {INITIAL_CATEGORIES.map(category => (
          <div
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className="group relative bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
              <img
                src={category.image}
                alt={category.nameEn}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-widest block mb-1">
                  Collection
                </span>
                <h3 className="text-lg font-extrabold tracking-tight">
                  {store.language === 'bn' ? category.nameBn : category.nameEn}
                </h3>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between bg-white text-xs">
              <span className="text-slate-500 font-medium">
                {category.itemCount} items available
              </span>
              <span className="text-amber-600 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Browse</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
