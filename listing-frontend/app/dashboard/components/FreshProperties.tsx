import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Bed, Bath, Car } from "lucide-react";

const FreshProperties = () => {
  const properties = [
    {
      id: 1,
      title: "Modern 3 BHK with Balcony",
      location: "Sector 62, Noida",
      price: "₹1.15 Cr",
      area: "1,650 sq ft",
      bedrooms: 3,
      bathrooms: 2,
      parking: 1,
      postedTime: "2 hours ago",
      image:
        "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
      tag: "Just Listed",
    },
    {
      id: 2,
      title: "Spacious 2 BHK Near Metro",
      location: "Rajouri Garden, Delhi",
      price: "₹85 Lakh",
      area: "1,100 sq ft",
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
      postedTime: "4 hours ago",
      image:
        "https://images.unsplash.com/photo-1571844307880-751c6d86f3f3?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
      tag: "Metro Nearby",
    },
    {
      id: 3,
      title: "Luxury 4 BHK Penthouse",
      location: "Bandra West, Mumbai",
      price: "₹4.5 Cr",
      area: "2,800 sq ft",
      bedrooms: 4,
      bathrooms: 4,
      parking: 2,
      postedTime: "1 hour ago",
      image:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
      tag: "Luxury",
    },
    {
      id: 4,
      title: "Cozy 1 BHK for Young Professionals",
      location: "Koramangala, Bangalore",
      price: "₹55 Lakh",
      area: "750 sq ft",
      bedrooms: 1,
      bathrooms: 1,
      parking: 1,
      postedTime: "30 minutes ago",
      image:
        "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
      tag: "Fresh",
    },
    {
      id: 5,
      title: "Garden Facing 3 BHK Villa",
      location: "Hinjewadi, Pune",
      price: "₹1.85 Cr",
      area: "2,200 sq ft",
      bedrooms: 3,
      bathrooms: 3,
      parking: 2,
      postedTime: "6 hours ago",
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
      tag: "Garden View",
    },
    {
      id: 6,
      title: "Premium 2 BHK with Amenities",
      location: "Whitefield, Bangalore",
      price: "₹95 Lakh",
      area: "1,400 sq ft",
      bedrooms: 2,
      bathrooms: 2,
      parking: 1,
      postedTime: "3 hours ago",
      image:
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=250&fit=crop&crop=entropy&auto=format&q=80",
      tag: "Premium",
    },
  ];

  return (
    <div className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-4">Fresh Properties</h2>
            <p className="text-muted-foreground text-lg">
              Recently listed properties you don&apos;t want to miss
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex">
            View All Fresh Properties
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <Badge className="bg-green-600 hover:bg-green-700 text-white">
                    {property.tag}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3">
                  <Badge variant="secondary" className="bg-black/70 text-white">
                    <Clock className="h-3 w-3 mr-1" />
                    {property.postedTime}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {property.title}
                </h3>
                <div className="flex items-center text-muted-foreground text-sm mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.location}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary">
                    {property.price}
                  </span>
                  <span className="text-muted-foreground">{property.area}</span>
                </div>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    {property.bedrooms} BHK
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {property.bathrooms}
                  </div>
                  <div className="flex items-center">
                    <Car className="h-4 w-4 mr-1" />
                    {property.parking}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Button variant="outline">View All Fresh Properties</Button>
        </div>
      </div>
    </div>
  );
};

export default FreshProperties;
