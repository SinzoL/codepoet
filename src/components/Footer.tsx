export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">
            © {new Date().getFullYear()} CodePoet.
          </p>
          <p className="text-gray-600"> 
            这里是代码和诗的世界 
          </p>
        </div>
      </div>
    </footer>
  );
}