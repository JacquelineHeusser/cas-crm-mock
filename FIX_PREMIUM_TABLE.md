# Änderungen für Premium-Tabelle

Bitte ersetze in der Datei `app/(authenticated)/quotes/new/page.tsx`:

## VS Eigenschäden (Zeile 806-811):
```tsx
        {/* VS Eigenschäden */}
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-0 border-b border-gray-100">
          <div className="text-sm font-medium text-gray-700 flex items-center p-8">VS Eigenschäden</div>
          <div className={`text-center text-sm text-[#0032A0] p-6 transition-colors ${selectedPackage === 'BASIC' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.BASIC.eigenSchadenSum)}</div>
          <div className={`text-center text-sm text-[#0032A0] p-6 transition-colors ${selectedPackage === 'OPTIMUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.OPTIMUM.eigenSchadenSum)}</div>
          <div className={`text-center text-sm text-[#0032A0] p-6 transition-colors ${selectedPackage === 'PREMIUM' ? 'bg-[#D9E8FC]' : 'hover:bg-gray-50'}`}>{formatCurrency(PACKAGES.PREMIUM.eigenSchadenSum)}</div>
        </div>
```

## Alle anderen VS-Zeilen: Ändere `grid-cols-4` zu `grid-cols-[1.5fr_1fr_1fr_1fr]` und `p-6` zu `p-8` in der linken Spalte
