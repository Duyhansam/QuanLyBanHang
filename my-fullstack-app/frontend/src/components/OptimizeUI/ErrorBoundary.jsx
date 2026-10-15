import { Component } from "react";

/**
 * Bắt lỗi xảy ra trong lúc render của các component con để không bị trắng trang.
 *
 * Props:
 *  - resetKey: khi giá trị này đổi (vd: pathname) thì tự thoát khỏi trạng thái lỗi
 *  - fullPage: true nếu dùng ở ngoài cùng (chiếm cả màn hình)
 *
 * Lưu ý: ErrorBoundary KHÔNG bắt lỗi trong event handler (onClick...), code bất đồng bộ
 * (fetch, setTimeout) hay lỗi của chính nó. Những lỗi đó vẫn cần try/catch.
 */
export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  // React gọi hàm này khi một component con ném lỗi lúc render. Trả về state mới để render() hiện giao diện báo lỗi thay vì trắng trang.
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Chỉ để ghi log. componentStack cho biết lỗi nằm ở component nào.
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error:", error, info.componentStack);
  }

  // Khi resetKey đổi (ví dụ người dùng chuyển sang trang khác) thì tự thoát khỏi trạng thái lỗi để trang mới hiển thị bình thường.
  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { fullPage = false } = this.props;

    return (
      <section
        role="alert"
        className={`flex flex-col items-center justify-center px-8 py-16 text-center bg-white text-black ${
          fullPage ? "min-h-screen" : "min-h-[60vh]"
        }`}
      >
        <p className="font-archivo-black text-5xl md:text-6xl">Oops!</p>

        <h1 className="mt-4 text-xl md:text-2xl font-bold uppercase tracking-wider">
          Something went wrong
        </h1>

        <p className="mt-3 max-w-md text-sm text-gray-600">
          An unexpected error occurred while showing this page. You can try
          again, or go back to the home page.
        </p>

        {import.meta.env.DEV && this.state.error && (
          <pre className="mt-6 max-w-2xl overflow-auto rounded bg-gray-100 p-4 text-left text-xs text-red-600">
            {String(this.state.error?.message || this.state.error)}
          </pre>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={this.handleRetry}
            className="bg-[#222] text-white text-xs font-bold uppercase tracking-wider px-8 py-4 rounded hover:bg-black transition-colors cursor-pointer shadow-sm"
          >
            Try again
          </button>
          {/* Dùng <a> (tải lại trang) để hoạt động cả khi boundary nằm ngoài Router */}
          <a
            href="/"
            className="border border-black text-black text-xs font-bold uppercase tracking-wider px-8 py-4 rounded hover:bg-black hover:text-white transition-colors"
          >
            Back to home
          </a>
        </div>
      </section>
    );
  }
}
