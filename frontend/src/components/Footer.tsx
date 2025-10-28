export function Footer() {
  return (
    <footer className="w-full bg-blue-800 text-white mt-16">
      <div className="container mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-200">About Us</a></li>
              <li><a href="#" className="hover:text-blue-200">Contact</a></li>
              <li><a href="#" className="hover:text-blue-200">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-200">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-200">Help Center</a></li>
              <li><a href="#" className="hover:text-blue-200">Tutorial Videos</a></li>
              <li><a href="#" className="hover:text-blue-200">FAQs</a></li>
              <li><a href="#" className="hover:text-blue-200">Student Guide</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li>Email: support@tutorsystem.edu</li>
              <li>Phone: (555) 123-4567</li>
              <li>Hours: Mon-Fri 9:00 AM - 5:00 PM</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-blue-700 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Tutor Support System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}