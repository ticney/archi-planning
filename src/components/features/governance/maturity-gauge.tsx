import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MaturityGaugeProps {
    score: number; // 0 to 100
    className?: string;
}

export function MaturityGauge({ score, className }: MaturityGaugeProps) {
    // Determine color based on score
    let colorClass = "bg-red-500";
    if (score >= 100) {
        colorClass = "bg-green-500";
    } else if (score >= 50) {
        colorClass = "bg-yellow-500";
    }

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Progress value={score} className="h-2 w-16" indicatorClassName={colorClass} />
            <span className="text-xs font-medium text-muted-foreground">{score}%</span>
        </div>
    );
}
