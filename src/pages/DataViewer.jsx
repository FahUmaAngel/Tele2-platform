import React, { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Database, ArrowLeft, RefreshCw } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function DataViewer() {
    const [activeTab, setActiveTab] = useState("orders");

    const entities = [
        { id: "orders", label: "Fiber Orders", fetch: base44.entities.FiberOrder.list },
        { id: "surveys", label: "Site Surveys", fetch: base44.entities.SiteSurvey.list },
        { id: "designs", label: "Network Designs", fetch: base44.entities.NetworkDesign.list },
        { id: "workOrders", label: "Work Orders", fetch: base44.entities.WorkOrder.list },
        { id: "rfsReports", label: "RFS Reports", fetch: base44.entities.RfsReport.list },
    ];

    const { data, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ['dataViewer', activeTab],
        queryFn: async () => {
            const entity = entities.find(e => e.id === activeTab);
            if (!entity) return [];
            return await entity.fetch();
        }
    });

    const getHeaders = (data) => {
        if (!data || data.length === 0) return [];
        return Object.keys(data[0]);
    };

    const headers = getHeaders(data);

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
            <div className="max-w-[1600px] mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Home')}>
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5 text-gray-500" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                <Database className="w-6 h-6 text-blue-600" />
                                Data Inspector
                            </h1>
                            <p className="text-gray-500 text-sm">
                                View raw data from system CSV files.
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => refetch()} disabled={isLoading || isRefetching}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </Button>
                </div>

                {/* Main Content */}
                <Card className="shadow-sm border-gray-200">
                    <CardHeader className="pb-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="mb-4">
                                {entities.map(entity => (
                                    <TabsTrigger key={entity.id} value={entity.id}>
                                        {entity.label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-600" />
                                <p>Loading data...</p>
                            </div>
                        ) : (
                            <div className="rounded-md border overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            {headers.length === 0 ? (
                                                <TableHead>No Data</TableHead>
                                            ) : (
                                                headers.map(header => (
                                                    <TableHead key={header} className="whitespace-nowrap font-semibold text-gray-700">
                                                        {header.replace(/_/g, ' ').toUpperCase()}
                                                    </TableHead>
                                                ))
                                            )}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(!data || data.length === 0) ? (
                                            <TableRow>
                                                <TableCell colSpan={headers.length || 1} className="h-24 text-center text-gray-500">
                                                    No records found for this entity.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            data.map((row, i) => (
                                                <TableRow key={i} className="hover:bg-gray-50/50">
                                                    {headers.map(header => (
                                                        <TableCell key={`${i}-${header}`} className="whitespace-nowrap max-w-[300px] truncate" title={typeof row[header] === 'object' ? JSON.stringify(row[header]) : row[header]}>
                                                            {typeof row[header] === 'object' ? JSON.stringify(row[header]) : row[header]}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                        <div className="mt-4 text-xs text-gray-400 text-right">
                            Showing {data?.length || 0} records
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
