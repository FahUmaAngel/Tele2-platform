import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Mail, Phone, Shield } from "lucide-react";

// Mock Data for UI Demonstration
const users = [
  { id: 1, name: "Amin", email: "amin@tele2.com", role: "Manager", department: "Operations", status: "active" },
  { id: 2, name: "Sarah Svensson", email: "sarah.s@ikea.com", role: "Client Admin", department: "Ikea", status: "active" },
  { id: 3, name: "Johan Andersson", email: "johan.a@tele2.com", role: "Technician", department: "Field Ops", status: "busy" },
  { id: 4, name: "Erik Lindberg", email: "erik.l@svea.se", role: "Client Viewer", department: "Svea AB", status: "inactive" },
  { id: 5, name: "Lisa Nilsson", email: "lisa.n@tele2.com", role: "Logistics", department: "Supply Chain", status: "active" },
];

export default function UserManagement() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage employee access and client accounts.</p>
        </div>
        <Button className="bg-[#0a1f33] hover:bg-[#153250]">
          <UserPlus className="w-4 h-4 mr-2" /> Invite User
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Search users by name, email or role..." className="pl-10 bg-white" />
        </div>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex justify-between items-center">
            <CardTitle>All Users</CardTitle>
            <span className="text-sm text-gray-500">{users.length} total users</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3 text-gray-400" />
                      {user.role}
                    </div>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`
                      ${user.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : ''}
                      ${user.status === 'busy' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                      ${user.status === 'inactive' ? 'bg-gray-50 text-gray-700 border-gray-200' : ''}
                    `}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}