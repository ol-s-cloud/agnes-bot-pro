/**
 * Portfolio API
 * GET /api/trading/portfolio - Get user portfolio
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth.js';
import tradingManager from '../../../lib/trading-manager/unified-trading-manager.js';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');

    const portfolios = await tradingManager.getUserPortfolio(session.user.id, accountId);

    // Calculate totals across all portfolios
    const totals = portfolios.reduce((acc, portfolio) => {
      acc.totalValue += parseFloat(portfolio.totalValue || 0);
      acc.totalCost += parseFloat(portfolio.totalCost || 0);
      acc.totalPnL += parseFloat(portfolio.totalPnL || 0);
      acc.positionCount += portfolio.positions.length;
      return acc;
    }, {
      totalValue: 0,
      totalCost: 0,
      totalPnL: 0,
      positionCount: 0
    });

    totals.totalPnLPercent = totals.totalCost > 0 
      ? (totals.totalPnL / totals.totalCost) * 100 
      : 0;

    return NextResponse.json({
      portfolios,
      totals
    });
  } catch (error) {
    console.error('Get portfolio error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch portfolio' 
    }, { status: 500 });
  }
}