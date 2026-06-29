export function Footer() {
  return (
    <footer className="mt-10 bg-espresso text-surface-warm py-10">
      <div className="max-w-[1280px] w-[calc(100%-48px)] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <strong className="font-serif text-3xl font-bold text-white mb-3 block">BBooks</strong>
          <p className="text-orange-200 leading-relaxed text-sm">Hiệu sách online ấm áp, gọn gàng và dễ mua cho mọi độc giả Việt.</p>
        </div>
        <div>
          <h3 className="font-bold text-lg text-white mb-3">Hỗ trợ</h3>
          <p className="text-orange-200 text-sm mt-1">Hotline: 1900 6868</p>
          <p className="text-orange-200 text-sm mt-1">Email: hello@bbooks.vn</p>
        </div>
        <div>
          <h3 className="font-bold text-lg text-white mb-3">Chính sách</h3>
          <p className="text-orange-200 text-sm mt-1">Vận chuyển · Đổi trả · Bảo mật</p>
        </div>
      </div>
    </footer>
  );
}
