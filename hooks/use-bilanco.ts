import { useDanisanOdemeleri, useGiderler, useCocukDanisanOdemeleri, useHesapHareketleri } from './use-csv-data';

function parseCurrencyTR(value: string): number {
  if (!value) return 0;
  return Number(
    value
      .replace(/\./g, "")
      .replace(/,/g, ".")
      .replace(/[^0-9.-]+/g, "")
  );
}

export function useBilanco() {
  const { data: gelirler, loading: gelirLoading, error: gelirError } = useDanisanOdemeleri();
  const { data: giderler, loading: giderLoading, error: giderError } = useGiderler();
  const { data: cocukGelirler, loading: cocukLoading, error: cocukError } = useCocukDanisanOdemeleri();
  const { data: hesapHareketleri, loading: hesapLoading, error: hesapError } = useHesapHareketleri();

  // Debug: Hesap hareketlerinde kitap kategorisini kontrol et
  const kitapSatirlari = hesapHareketleri.filter(row => (row.kategori || '').toUpperCase().includes('KİTAP'));
  console.log('Kitap kategorisindeki satırlar:', kitapSatirlari);
  
  const kitapGeliri = kitapSatirlari.reduce((sum, row) => {
    const tutar = parseCurrencyTR(row.tutar || '0');
    console.log('Kitap satırı:', row.kategori, 'Tutar:', row.tutar, 'Parsed:', tutar);
    return sum + tutar;
  }, 0);
  
  console.log('Toplam kitap geliri:', kitapGeliri);

  const danisanGeliri = gelirler.reduce((sum, row) => {
    return sum + parseCurrencyTR(row.odenenUcret || '0');
  }, 0);
  
  const cocukGeliri = cocukGelirler.reduce((sum, row) => {
    return sum + parseCurrencyTR(row.odenenUcret || '0');
  }, 0);

  const toplamGelir = danisanGeliri + cocukGeliri + kitapGeliri;
  
  console.log('Gelir detayları:', {
    danisanGeliri,
    cocukGeliri,
    kitapGeliri,
    toplamGelir
  });

  const toplamGider = giderler.reduce((sum, row) => {
    return sum + parseCurrencyTR(row.harcamaTutari || '0');
  }, 0);

  return {
    toplamGelir,
    toplamGider,
    netBakiye: toplamGelir - toplamGider,
    loading: gelirLoading || giderLoading || cocukLoading || hesapLoading,
    error: gelirError || giderError || cocukError || hesapError,
  };
} 