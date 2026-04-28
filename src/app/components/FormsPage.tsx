import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Save } from "lucide-react";
import { motion } from "motion/react";
import { profileAPI, APIError } from "../../lib/api";

export default function FormsPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    address: "",
    taxId: "",
    notes: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.companyName) newErrors.companyName = "Company Name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.taxId) newErrors.taxId = "Tax ID is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill in all required fields", {
        description: "Some fields are missing or invalid."
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await profileAPI.updateProfile(formData);
      setIsSuccess(true);
      toast.success("Profile updated successfully!", {
        description: "Your changes have been saved."
      });

      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          companyName: "",
          email: "",
          phone: "",
          address: "",
          taxId: "",
          notes: ""
        });
      }, 3000);
    } catch (err) {
      const msg =
        err instanceof APIError
          ? err.message
          : "Failed to save profile. Please try again.";
      setSubmitError(msg);
      toast.error("Failed to save profile", { description: msg });
      console.error("[FormsPage] updateProfile error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Company Profile Settings</h1>
        <p className="text-gray-600">Update your organization details and preferences.</p>
      </div>

      {submitError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{submitError}</p>
        </div>
      )}

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
              <h3 className="text-2xl font-bold text-gray-900">Settings Saved</h3>
              <p className="text-gray-600">Your organization profile has been successfully updated.</p>
            </div>
          </motion.div>
        )}

        <div className="space-y-6">
          <Card className={Object.keys(errors).length > 0 ? "border-red-200" : ""}>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Primary contact details for the organization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className={errors.companyName ? "text-red-500" : ""}>Company Name *</Label>
                  <Input 
                    id="companyName" 
                    placeholder="Acme Logistics Inc." 
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    className={errors.companyName ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.companyName && <p className="text-sm text-red-500">{errors.companyName}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="taxId" className={errors.taxId ? "text-red-500" : ""}>Tax ID / EIN *</Label>
                  <Input 
                    id="taxId" 
                    placeholder="XX-XXXXXXX" 
                    value={formData.taxId}
                    onChange={(e) => handleInputChange("taxId", e.target.value)}
                    className={errors.taxId ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.taxId && <p className="text-sm text-red-500">{errors.taxId}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className={errors.email ? "text-red-500" : ""}>Corporate Email *</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="billing@acmelogistics.com" 
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className={errors.phone ? "text-red-500" : ""}>Primary Phone *</Label>
                  <Input 
                    id="phone" 
                    placeholder="(555) 123-4567" 
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className={errors.address ? "text-red-500" : ""}>HQ Address *</Label>
                <Textarea 
                  id="address" 
                  placeholder="123 Supply Chain Blvd, Logistics City, CA 90210" 
                  rows={2}
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={errors.address ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Any specific operating hours or special instructions..." 
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" disabled={isSubmitting || isSuccess}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className={`gap-2 min-w-[150px] transition-all duration-300 ${isSuccess ? "bg-green-600 hover:bg-green-700" : ""}`}
              disabled={isSubmitting || isSuccess}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isSuccess ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isSubmitting ? "Saving..." : isSuccess ? "Saved!" : "Save Changes"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
