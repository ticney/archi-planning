import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProjectDetailsPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <div className="p-10">
            <h1 className="text-2xl font-bold">Project Dashboard</h1>
            <p className="text-muted-foreground mt-2">Project ID: {id}</p>
            <div className="mt-8 p-4 border rounded-lg bg-muted/50">
                <h2 className="font-semibold mb-2">Status</h2>
                <p>Pending Review (Placeholder)</p>
            </div>
        </div>
    );
}
