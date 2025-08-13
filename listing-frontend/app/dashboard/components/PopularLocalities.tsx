import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";

const PopularLocalities = () => {
  const localities = [
    {
      name: "Gurgaon",
      properties: "15,426 Properties",
      rating: 4.2,
      image:
        "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=300&h=200&fit=crop&crop=entropy&auto=format&q=80",
      priceRange: "₹85L - 5.5Cr",
    },
    {
      name: "Noida",
      properties: "12,845 Properties",
      rating: 4.0,
      image:
        "https://images.unsplash.com/photo-1571844307880-751c6d86f3f3?w=300&h=200&fit=crop&crop=entropy&auto=format&q=80",
      priceRange: "₹45L - 3.2Cr",
    },
    {
      name: "Mumbai",
      properties: "28,963 Properties",
      rating: 4.5,
      image:
        "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=300&h=200&fit=crop&crop=entropy&auto=format&q=80",
      priceRange: "₹1.2Cr - 15Cr",
    },
    {
      name: "Bangalore",
      properties: "22,156 Properties",
      rating: 4.3,
      image:
        "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=300&h=200&fit=crop&crop=entropy&auto=format&q=80",
      priceRange: "₹65L - 4.8Cr",
    },
    {
      name: "Pune",
      properties: "18,742 Properties",
      rating: 4.1,
      image:
        "https://images.unsplash.com/photo-1571844307880-751c6d86f3f3?w=300&h=200&fit=crop&crop=entropy&auto=format&q=80",
      priceRange: "₹55L - 3.5Cr",
    },
    {
      name: "Delhi",
      properties: "19,834 Properties",
      rating: 4.2,
      image:
        "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=300&h=200&fit=crop&crop=entropy&auto=format&q=80",
      priceRange: "₹75L - 6.2Cr",
    },
  ];

  return (
    <div className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Explore Popular Localities
          </h2>
          <p className="text-muted-foreground text-lg">
            Discover prime locations with verified properties
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localities.map((locality, index) => (
            <Card
              key={index}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <div className="relative">
                <img
                  src={locality.image}
                  alt={locality.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white text-foreground flex items-center space-x-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{locality.rating}</span>
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center mb-2">
                  <MapPin className="h-4 w-4 text-primary mr-2" />
                  <h3 className="text-xl font-bold">{locality.name}</h3>
                </div>
                <p className="text-muted-foreground mb-2">
                  {locality.properties}
                </p>
                <p className="text-primary font-semibold">
                  {locality.priceRange}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularLocalities;
