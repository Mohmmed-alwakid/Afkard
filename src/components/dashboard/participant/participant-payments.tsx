'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-browser';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CheckCircle, 
  Clock,
  XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface PaymentsProps {
  userId: string;
}

interface Payment {
  id: string;
  study_id: string;
  reward_amount: number;
  reward_status: 'pending' | 'paid' | 'cancelled';
  payment_date: string | null;
  study: {
    title: string;
  };
}

export function ParticipantPayments({ userId }: PaymentsProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);

  useEffect(() => {
    async function fetchPayments() {
      try {
        setIsLoading(true);
        
        // Fetch payments
        const { data, error } = await supabase
          .from('study_participants')
          .select(`
            id,
            study_id,
            reward_amount,
            reward_status,
            payment_date,
            studies:study_id (
              title
            )
          `)
          .eq('user_id', userId)
          .not('reward_amount', 'is', null)
          .order('payment_date', { ascending: false });
        
        if (error) throw error;
        
        setPayments(data || []);
        
        // Calculate totals
        let earned = 0;
        let pending = 0;
        
        data?.forEach(payment => {
          if (payment.reward_status === 'paid' && payment.reward_amount) {
            earned += payment.reward_amount;
          } else if (payment.reward_status === 'pending' && payment.reward_amount) {
            pending += payment.reward_amount;
          }
        });
        
        setTotalEarned(earned);
        setPendingAmount(pending);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPayments();
  }, [userId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your study payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full animate-pulse rounded-md bg-muted"></div>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your study payments</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
          <h3 className="text-lg font-medium">No payments yet</h3>
          <p className="text-muted-foreground mt-2">
            Complete studies to earn rewards.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>Your study payments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalEarned.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From completed studies</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${pendingAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Study</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.study.title}</TableCell>
                <TableCell>${payment.reward_amount.toFixed(2)}</TableCell>
                <TableCell>
                  <PaymentStatusBadge status={payment.reward_status} />
                </TableCell>
                <TableCell>
                  {payment.payment_date 
                    ? format(new Date(payment.payment_date), 'MMM d, yyyy')
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PaymentStatusBadge({ status }: { status: Payment['reward_status'] }) {
  const statusConfig = {
    pending: {
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      icon: <Clock className="mr-1 h-3 w-3" />,
    },
    paid: {
      label: 'Paid',
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      icon: <CheckCircle className="mr-1 h-3 w-3" />,
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      icon: <XCircle className="mr-1 h-3 w-3" />,
    },
  };

  const config = statusConfig[status];

  return (
    <Badge className={`flex items-center ${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
} 