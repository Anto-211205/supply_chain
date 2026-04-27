import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ArrowLeft, CalendarIcon, CheckCircle2, Package } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";

interface NewShipmentFormProps {
  onBack?: () => void;
  onSuccess?: (id: string) => void;
}

export default function NewShipmentForm({ onBack, onSuccess }: NewShipmentFormProps) {
  const [pickupDate, setPickupDate] = useState<Date>();
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  
  const [formData, setFormData] = useState({
    description: "",
    weight: "",
    dimensions: "",
    origin: "",
    originCity: "",
    originState: "",
    originZip: "",
    destination: "",
    destCity: "",
    destState: "",
    destZip: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.weight) newErrors.weight = "Weight is required";
    if (!formData.origin) newErrors.origin = "Origin address is required";
    if (!formData.destination) newErrors.destination = "Destination address is required";
    if (!pickupDate) newErrors.pickupDate = "Pickup date is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill in all required fields", {
        description: "Some fields are missing or invalid."
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success("Shipment created successfully!", {
        description: "AI route optimization has started."
      });
      
      // Auto transition after success
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(`SHP-${Math.floor(10000 + Math.random() * 90000)}`);
        }
      }, 1500);
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6 relative">
      <div className="flex items-center gap-4 mb-2">
        {onBack && (
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-semibold">Create New Shipment</h1>
          <p className="text-gray-600">Enter shipment details for AI-powered route optimization</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-green-200"
          >
            <div className="text-center space-y-4 p-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900">Shipment Created</h3>
              <p className="text-gray-600">Your shipment has been successfully queued for routing.</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className={errors.description || errors.weight ? "border-red-200" : ""}>
              <CardHeader>
                <CardTitle>Shipment Information</CardTitle>
                <CardDescription>Basic details about the shipment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shipment-id">Shipment ID</Label>
                    <Input id="shipment-id" placeholder="Auto-generated" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority Level</Label>
                    <Select defaultValue="standard">
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className={errors.description ? "text-red-500" : ""}>Shipment Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the contents and any special handling requirements"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className={errors.description ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className={errors.weight ? "text-red-500" : ""}>Weight (lbs) *</Label>
                    <Input 
                      id="weight" 
                      type="number" 
                      placeholder="0"
                      value={formData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      className={errors.weight ? "border-red-500 focus-visible:ring-red-500" : ""}
                    />
                    {errors.weight && <p className="text-sm text-red-500">{errors.weight}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dimensions">Dimensions</Label>
                    <Input id="dimensions" placeholder="L x W x H" value={formData.dimensions} onChange={e => handleInputChange("dimensions", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Declared Value ($)</Label>
                    <Input id="value" type="number" placeholder="0" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={errors.origin || errors.destination ? "border-red-200" : ""}>
              <CardHeader>
                <CardTitle>Route Details</CardTitle>
                <CardDescription>Origin and destination information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="origin" className={errors.origin ? "text-red-500" : ""}>Origin Address *</Label>
                  <Input 
                    id="origin" 
                    placeholder="Street address, City, State, ZIP"
                    value={formData.origin}
                    onChange={(e) => handleInputChange("origin", e.target.value)}
                    className={errors.origin ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.origin && <p className="text-sm text-red-500">{errors.origin}</p>}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin-city">City</Label>
                    <Input id="origin-city" placeholder="Los Angeles" value={formData.originCity} onChange={e => handleInputChange("originCity", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin-state">State</Label>
                    <Input id="origin-state" placeholder="CA" value={formData.originState} onChange={e => handleInputChange("originState", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="origin-zip">ZIP Code</Label>
                    <Input id="origin-zip" placeholder="90001" value={formData.originZip} onChange={e => handleInputChange("originZip", e.target.value)} />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <Label htmlFor="destination" className={errors.destination ? "text-red-500" : ""}>Destination Address *</Label>
                  <Input 
                    id="destination" 
                    placeholder="Street address, City, State, ZIP" 
                    className={`mt-2 ${errors.destination ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    value={formData.destination}
                    onChange={(e) => handleInputChange("destination", e.target.value)}
                  />
                  {errors.destination && <p className="text-sm text-red-500">{errors.destination}</p>}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dest-city">City</Label>
                    <Input id="dest-city" placeholder="New York" value={formData.destCity} onChange={e => handleInputChange("destCity", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dest-state">State</Label>
                    <Input id="dest-state" placeholder="NY" value={formData.destState} onChange={e => handleInputChange("destState", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dest-zip">ZIP Code</Label>
                    <Input id="dest-zip" placeholder="10001" value={formData.destZip} onChange={e => handleInputChange("destZip", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={errors.pickupDate ? "border-red-200" : ""}>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
                <CardDescription>Pickup and delivery timing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className={errors.pickupDate ? "text-red-500" : ""}>Pickup Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          className={`w-full justify-start ${errors.pickupDate ? "border-red-500 text-red-500" : ""}`} 
                          type="button"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {pickupDate ? format(pickupDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar 
                          mode="single" 
                          selected={pickupDate} 
                          onSelect={(d) => {
                            setPickupDate(d);
                            if (errors.pickupDate) setErrors(prev => ({ ...prev, pickupDate: "" }));
                          }} 
                        />
                      </PopoverContent>
                    </Popover>
                    {errors.pickupDate && <p className="text-sm text-red-500">{errors.pickupDate}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Requested Delivery Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start" type="button">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {deliveryDate ? format(deliveryDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={deliveryDate} onSelect={setDeliveryDate} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pickup-time">Pickup Time Window</Label>
                    <Select defaultValue="morning">
                      <SelectTrigger id="pickup-time">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (8AM-12PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12PM-5PM)</SelectItem>
                        <SelectItem value="evening">Evening (5PM-8PM)</SelectItem>
                        <SelectItem value="anytime">Anytime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="delivery-time">Delivery Time Window</Label>
                    <Select defaultValue="morning">
                      <SelectTrigger id="delivery-time">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning (8AM-12PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12PM-5PM)</SelectItem>
                        <SelectItem value="evening">Evening (5PM-8PM)</SelectItem>
                        <SelectItem value="anytime">Anytime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Carrier Selection</CardTitle>
                <CardDescription>Choose carrier or use AI recommendation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="carrier">Preferred Carrier</Label>
                  <Select defaultValue="ai-select">
                    <SelectTrigger id="carrier">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai-select">AI Auto-Select (Recommended)</SelectItem>
                      <SelectItem value="fastfreight">FastFreight Express</SelectItem>
                      <SelectItem value="quickship">QuickShip Logistics</SelectItem>
                      <SelectItem value="reliable">Reliable Transport Co</SelectItem>
                      <SelectItem value="pacific">Pacific Carriers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-level">Service Level</Label>
                  <Select defaultValue="standard">
                    <SelectTrigger id="service-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                      <SelectItem value="overnight">Overnight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Optimization</CardTitle>
                <CardDescription>Intelligent routing options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <div>
                    <p className="text-sm">Cost Optimization</p>
                    <p className="text-xs text-gray-600">Minimize transportation costs</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>

                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <div>
                    <p className="text-sm">Time Optimization</p>
                    <p className="text-xs text-gray-600">Fastest delivery route</p>
                  </div>
                  <input type="checkbox" className="h-4 w-4" />
                </div>

                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <div>
                    <p className="text-sm">Risk Avoidance</p>
                    <p className="text-xs text-gray-600">Avoid high-risk areas</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>

                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <div>
                    <p className="text-sm">Real-time Rerouting</p>
                    <p className="text-xs text-gray-600">Auto-adjust for conditions</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estimated Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Rate</span>
                    <span>$3,850</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fuel Surcharge</span>
                    <span>$420</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>AI Optimization Savings</span>
                    <span>-$680</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span>Total Estimated Cost</span>
                      <span className="text-xl font-semibold">$3,590</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button 
                type="submit" 
                className={`w-full gap-2 transition-all duration-300 ${isSuccess ? "bg-green-600 hover:bg-green-700" : ""}`} 
                size="lg"
                disabled={isSubmitting || isSuccess}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isSuccess ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Package className="w-5 h-5" />
                )}
                {isSubmitting ? "Creating..." : isSuccess ? "Success!" : "Create Shipment"}
              </Button>
              <Button type="button" variant="outline" className="w-full" disabled={isSubmitting || isSuccess}>
                Save as Draft
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
