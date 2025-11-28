import { Card } from "@/components/ui/card";
import { Wrench, Droplets, Hammer, Paintbrush, Box, Grid3x3 } from "lucide-react";

const categories = [
  {
    icon: Wrench,
    title: "Electricians",
    description: "Wiring, repairs, installations",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Droplets,
    title: "Plumbers",
    description: "Pipes, fixtures, drainage",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Hammer,
    title: "Masons",
    description: "Brickwork, foundations, structures",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Paintbrush,
    title: "Painters",
    description: "Interior & exterior finishing",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Box,
    title: "Carpenters",
    description: "Furniture, doors, woodwork",
    color: "text-earth",
    bgColor: "bg-earth/10",
  },
  {
    icon: Grid3x3,
    title: "Tilers",
    description: "Floor & wall tiling",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

export const SkillCategories = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Find the Right Professional
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse verified fundis across multiple construction specialties
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card
                key={category.title}
                className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-primary/50 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 rounded-2xl ${category.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-8 h-8 ${category.color}`} />
                </div>
                <h3 className="text-xl font-heading font-bold mb-2">{category.title}</h3>
                <p className="text-muted-foreground">{category.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
