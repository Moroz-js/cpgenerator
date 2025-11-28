'use client';

import type { TeamEstimateBlockProps } from '@/lib/builder/block-types';
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

interface TeamEstimateBlockComponentProps {
  props: TeamEstimateBlockProps;
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

export function TeamEstimateBlock({
  props,
  brand,
}: TeamEstimateBlockComponentProps) {
  const { heading, members, currency = 'RUB', showTotal = true } = props;

  const currencySymbol = getCurrencySymbol(currency);

  const grandTotal = members.reduce(
    (sum, member) => sum + member.qty * member.rate,
    0
  );

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
            <TableHead>Роль</TableHead>
            <TableHead className="text-right">Кол-во</TableHead>
            <TableHead className="text-right">Ставка</TableHead>
            <TableHead className="text-right">Итого</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member, index) => {
            const total = member.qty * member.rate;
            return (
              <TableRow key={index}>
                <TableCell className="font-medium">{member.role}</TableCell>
                <TableCell className="text-right">{member.qty}</TableCell>
                <TableCell className="text-right">
                  {member.rate.toLocaleString()} {currencySymbol}
                </TableCell>
                <TableCell className="text-right">
                  {total.toLocaleString()} {currencySymbol}
                </TableCell>
              </TableRow>
            );
          })}
          {showTotal && members.length > 0 && (
            <TableRow>
              <TableCell colSpan={3} className="font-bold text-right">
                Общая сумма:
              </TableCell>
              <TableCell
                className="font-bold text-right"
                style={{
                  color: brand?.colors?.primary || '#0062ff',
                }}
              >
                {grandTotal.toLocaleString()} {currencySymbol}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {members.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Добавьте специалистов в настройках блока
        </div>
      )}
    </div>
  );
}
