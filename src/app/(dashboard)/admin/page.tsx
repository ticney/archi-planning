
import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ListChecks } from 'lucide-react';

export default function AdminPage() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/admin/checklists">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <ListChecks className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>Checklists</CardTitle>
                        </div>
                        <CardDescription>Manage governance requirements and rules</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Configure topics, update proof requirements, and manage dynamic validation rules.
                        </p>
                    </CardContent>
                </Card>
            </Link>
        </div>
    );
}
