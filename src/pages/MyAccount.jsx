import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Briefcase, Shield } from "lucide-react";

export default function MyAccount() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg">
          AM
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Amin</h1>
          <p className="text-gray-500">Manager • Operations Department</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <Mail className="text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Email Address</p>
                <p className="text-gray-900">amin@tele2.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <Briefcase className="text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="text-gray-900">Manager</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <Shield className="text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-500">Access Level</p>
                <p className="text-gray-900">Level 4 (Admin)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}