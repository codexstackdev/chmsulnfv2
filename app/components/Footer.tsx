import React from "react";

const Footer = () => {
  return (
    <>
      <footer className="border-t border-border bg-background/30 py-12 mt-20">
        <div className="container mx-auto px-4 sm:px-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} University Lost & Found. For student
            use only.
          </p>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
