import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Contact Support</h1>
        <p className="text-gray-500">Need help with the platform? Get in touch with our support team.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="text-center hover:shadow-md transition-shadow">
          <CardContent className="pt-6 space-y-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900">Phone Support</h3>
            <p className="text-sm text-gray-500">Mon-Fri 8am-5pm CET</p>
            <p className="text-blue-600 font-medium">+46 8 562 22 000</p>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-md transition-shadow">
          <CardContent className="pt-6 space-y-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900">Email Support</h3>
            <p className="text-sm text-gray-500">24/7 Response</p>
            <p className="text-blue-600 font-medium">support@tele2.com</p>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-md transition-shadow">
          <CardContent className="pt-6 space-y-4">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900">Office</h3>
            <p className="text-sm text-gray-500">Headquarters</p>
            <p className="text-gray-900 font-medium">Borgarfjordsgatan 16<br/>164 40 Kista, Sweden</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}