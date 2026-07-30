const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 font-display font-bold text-lg">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
            B
          </div>
          Billable
        </div>
        <div className="flex gap-8 text-sm text-muted-foreground">
          <a
            href="/privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy
          </a>
          <a href="/terms" className="hover:text-foreground transition-colors">
            Terms
          </a>
          <a
            href="/contact"
            className="hover:text-foreground transition-colors"
          >
            Contact
          </a>
          <a
            href="https://github.com/faisalsaifii/billable"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
        <div className="text-sm text-muted-foreground">
          © 2024 Billable. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
