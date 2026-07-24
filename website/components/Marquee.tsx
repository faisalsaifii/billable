const brands = [
  "Stripe",
  "Shopify",
  "QuickBooks",
  "Xero",
  "FreshBooks",
  "Wave",
  "PayPal",
  "Square",
];

const Marquee = () => {
  return (
    <section className="py-16 border-y border-border/50 overflow-hidden">
      <p className="text-center text-xs text-muted-foreground font-display tracking-widest uppercase mb-8">
        Trusted by teams using
      </p>
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />
        <div className="flex animate-marquee">
          {[...brands, ...brands].map((brand, i) => (
            <div
              key={i}
              className="flex-shrink-0 mx-12 text-2xl font-display font-bold text-muted-foreground/30 select-none"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Marquee;
