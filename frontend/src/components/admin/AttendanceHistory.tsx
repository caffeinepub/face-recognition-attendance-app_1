import { useState } from 'react';
import { useGetAllAttendanceRecords, useGetAllStudentProfiles } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar, Download, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function AttendanceHistory() {
  const { data: attendanceRecords, isLoading } = useGetAllAttendanceRecords();
  const { data: students } = useGetAllStudentProfiles();
  const [searchQuery, setSearchQuery] = useState('');

  const getStudentName = (studentId: string) => {
    const student = students?.find((s) => s.studentId === studentId);
    return student?.name || studentId;
  };

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

  const filteredRecords = attendanceRecords?.filter((record) => {
    const studentName = getStudentName(record.studentId).toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      studentName.includes(query) ||
      record.studentId.toLowerCase().includes(query) ||
      record.classId.toLowerCase().includes(query)
    );
  });

  const sortedRecords = filteredRecords?.sort((a, b) => Number(b.timestamp - a.timestamp));

  const handleExport = () => {
    if (!sortedRecords || sortedRecords.length === 0) return;

    const csvContent = [
      ['Student Name', 'Student ID', 'Class ID', 'Date', 'Time'],
      ...sortedRecords.map((record) => [
        getStudentName(record.studentId),
        record.studentId,
        record.classId,
        formatDate(record.timestamp),
        formatTime(record.timestamp),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Attendance History
            </CardTitle>
            <CardDescription>View and export attendance records</CardDescription>
          </div>
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={!sortedRecords || sortedRecords.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by student name, ID, or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : sortedRecords && sortedRecords.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRecords.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{getStudentName(record.studentId)}</TableCell>
                    <TableCell className="font-mono text-sm">{record.studentId}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{record.classId}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(record.timestamp)}</TableCell>
                    <TableCell>{formatTime(record.timestamp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 p-8 text-center">
            <Calendar className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No attendance records found matching your search' : 'No attendance records yet'}
            </p>
          </div>
        )}

        {sortedRecords && sortedRecords.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Showing {sortedRecords.length} of {attendanceRecords?.length} records
          </div>
        )}
      </CardContent>
    </Card>
  );
}
