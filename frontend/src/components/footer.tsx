import Link from "next/link";
import { CheckSquare, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 md:gap-3 group">
              <div className="rounded-lg bg-primary p-2 md:p-2.5 transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg">
                <CheckSquare className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
              </div>
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                TaskFlow
              </span>
            </Link>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-xs">
              Streamline your workflow with our modern task management solution.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-base md:text-lg mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm md:text-base text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm md:text-base text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm md:text-base text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-base md:text-lg mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm md:text-base text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm md:text-base text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm md:text-base text-muted-foreground hover:text-primary transition-all duration-200 hover:translate-x-1 inline-block"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-base md:text-lg mb-4">Connect</h3>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2.5 hover:bg-accent transition-all duration-200 hover:scale-110 hover:shadow-md active:scale-95"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2.5 hover:bg-accent transition-all duration-200 hover:scale-110 hover:shadow-md active:scale-95"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2.5 hover:bg-accent transition-all duration-200 hover:scale-110 hover:shadow-md active:scale-95"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm md:text-base text-muted-foreground">
              © {currentYear} TaskFlow. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="/"
                className="text-sm md:text-base text-muted-foreground hover:text-primary transition-all duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/"
                className="text-sm md:text-base text-muted-foreground hover:text-primary transition-all duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
