'use client';

import type { PaymentBlockProps } from '@/lib/builder/block-types';
import type { WorkspaceBrandSettings } from '@/types/database';
import { BlockHeading } from './BlockHeading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PaymentBlockComponentProps {
  props: PaymentBlockProps;
  brand: WorkspaceBrandSettings | null;
}

const getCurrencySymbol = (currency?: string): string => {
  switch (currency?.toUpperCase()) {
    case 'RUB':
      return '₽';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    default:
      return currency || 'RUB';
  }
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export function PaymentBlock({
  props,
  brand,
}: PaymentBlockComponentProps) {
  const { heading, items, currency = 'RUB' } = props;

  const currencySymbol = getCurrencySymbol(currency);

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div
      className="w-full"
      style={{
        fontFamily: brand?.typography?.bodyFont || 'inherit',
      }}
    >
      {heading?.text && <BlockHeading text={heading.text} align={heading.align} />}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Этап</TableHead>
            <TableHead>Дата</TableHead>
            <TableHead className="text-right">Сумма</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.label}</TableCell>
              <TableCell>{formatDate(item.date)}</TableCell>
              <TableCell className="text-right">
                {item.amount.toLocaleString()} {currencySymbol}
              </TableCell>
            </TableRow>
          ))}
          {items.length > 0 && (
            <TableRow>
              <TableCell colSpan={2} className="font-bold text-right">
                Общая сумма:
              </TableCell>
              <TableCell
                className="font-bold text-right"
                style={{
                  color: brand?.colors?.primary || '#0062ff',
                }}
              >
                {totalAmount.toLocaleString()} {currencySymbol}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Добавьте платежи в настройках блока
        </div>
      )}
    </div>
  );
}
