import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import type { AttendanceRecord } from '../../backend';

interface AttendanceListProps {
  records: AttendanceRecord[];
}

export default function AttendanceList({ records }: AttendanceListProps) {
  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const sortedRecords = [...records].sort((a, b) => Number(b.timestamp - a.timestamp));

  if (records.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-6 text-center">
        <Calendar className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No attendance records yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-64">
      <div className="space-y-2">
        {sortedRecords.map((record, index) => (
          <div key={index} className="flex items-center justify-between rounded-lg border bg-card p-3">
            <div className="space-y-1">
              <Badge variant="secondary">{record.classId}</Badge>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatDate(record.timestamp)}
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatTime(record.timestamp)}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
