
import { Code, Palette, Zap, Shield } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Code,
      title: "TypeScript Ready",
      description: "Built with TypeScript for better development experience and type safety."
    },
    {
      icon: Palette,
      title: "Beautiful Design",
      description: "Modern and clean design with carefully crafted components and animations."
    },
    {
      icon: Zap,
      title: "Fast Performance",
      description: "Optimized for speed with modern build tools and best practices."
    },
    {
      icon: Shield,
      title: "Best Practices",
      description: "Following industry standards and best practices for scalable applications."
    }
  ];

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Features & Benefits
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to build modern web applications with confidence
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-background p-6 rounded-xl border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
