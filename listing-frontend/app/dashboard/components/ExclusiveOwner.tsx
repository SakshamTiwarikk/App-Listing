import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Share2, Camera, User } from "lucide-react";

const ExclusiveOwner = () => {
  const properties = [
    {
      id: 1,
      title: "3 BHK Apartment in Sector 47",
      location: "Sector 47, Gurgaon",
      price: "₹1.25 Cr",
      area: "1,850 sq ft",
      images: 15,
      owner: "Direct Owner",
      image:
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
      tag: "Ready to Move",
    },
    {
      id: 2,
      title: "2 BHK Independent House",
      location: "Rajouri Garden, Delhi",
      price: "₹95 Lakh",
      area: "1,200 sq ft",
      images: 12,
      owner: "Direct Owner",
      image:
        "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
      tag: "Verified",
    },
    {
      id: 3,
      title: "4 BHK Luxury Villa",
      location: "Whitefield, Bangalore",
      price: "₹2.8 Cr",
      area: "3,200 sq ft",
      images: 25,
      owner: "Direct Owner",
      image:
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
      tag: "Premium",
    },
    {
      id: 4,
      title: "1 BHK Studio Apartment",
      location: "Andheri West, Mumbai",
      price: "₹75 Lakh",
      area: "650 sq ft",
      images: 8,
      owner: "Direct Owner",
      image:
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
      tag: "New",
    },
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-4">
              Exclusive Owner Properties
            </h2>
            <p className="text-muted-foreground text-lg">
              Connect directly with property owners - No brokerage
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex">
            View All Owner Properties
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {properties.map((property) => (
            <Card
              key={property.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
            >
              <div className="relative">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-accent hover:bg-accent text-accent-foreground">
                    {property.tag}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3 flex space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-3 right-3">
                  <Badge variant="secondary" className="bg-black/70 text-white">
                    <Camera className="h-3 w-3 mr-1" />
                    {property.images}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {property.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {property.location}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-primary">
                    {property.price}
                  </span>
                  <span className="text-muted-foreground">{property.area}</span>
                </div>

                <div className="flex items-center">
                  <User className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-green-600 font-medium text-sm">
                    {property.owner}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Button variant="outline">View All Owner Properties</Button>
        </div>
      </div>
    </div>
  );
};

export default ExclusiveOwner;