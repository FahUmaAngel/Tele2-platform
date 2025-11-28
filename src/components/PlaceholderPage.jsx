import React from 'react';
import { Construction } from "lucide-react";

const PlaceholderPage = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
    <div className="bg-blue-50 p-6 rounded-full mb-6">
      <Construction className="w-12 h-12 text-blue-600" />
    </div>
    <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
    <p className="text-gray-500 max-w-md">{description}</p>
    <div className="mt-8 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm font-medium">
      This module is under active development.
    </div>
  </div>
);

export default PlaceholderPage;