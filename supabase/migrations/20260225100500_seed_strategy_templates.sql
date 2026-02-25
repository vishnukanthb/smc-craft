-- Seed initial strategy templates for Smart Money Concepts builder
-- These inserts are idempotent; rerunning migration keeps existing records intact.

INSERT INTO public.strategy_templates (id, name, description, market_type, trading_pair, config)
VALUES
  (
    '11111111-1111-4000-8000-000000000001',
    'London Killzone OB + FVG',
    'Enters on bullish order block with FVG confluence during London session',
    'forex',
    'EUR/USD',
    '{
      "timeframes": ["15m", "1H"],
      "conditions": [
        {"id": "1", "logicOperator": "AND", "condition": {"type": "session_filter", "sessions": ["london"]}},
        {"id": "2", "logicOperator": "AND", "condition": {"type": "order_block", "obType": "bullish", "mustBeUnmitigated": true, "timeframe": "1H", "requireTap": true}},
        {"id": "3", "logicOperator": "AND", "condition": {"type": "fair_value_gap", "fvgType": "bullish", "minGapSize": 10, "gapSizeUnit": "pips", "requireFill": "partial"}}
      ],
      "exitConfig": {"stopLoss": {"type": "below_ob", "value": 5, "unit": "pips"}, "takeProfit": {"type": "rr_ratio", "value": 3, "unit": "ratio", "partials": []}, "trailingStop": {"enabled": false, "activationPips": 30, "trailPips": 10}, "breakEven": {"enabled": true, "triggerPips": 15}},
      "riskConfig": {"accountBalance": 25000, "riskPerTrade": 1, "stopLossPips": 8, "maxConcurrentTrades": 2, "maxDailyLoss": 3, "maxDrawdown": 8}
    }'::jsonb
  ),
  (
    '11111111-1111-4000-8000-000000000002',
    'Liquidity Sweep Reversal',
    'Catches reversals after sell-side liquidity sweeps with CHoCH confirmation',
    'crypto',
    'BTC/USDT',
    '{
      "timeframes": ["5m", "15m"],
      "conditions": [
        {"id": "1", "logicOperator": "AND", "condition": {"type": "liquidity_sweep", "direction": "sell-side", "lookbackPeriod": 50, "requireWickRejection": true}},
        {"id": "2", "logicOperator": "AND", "condition": {"type": "change_of_character", "direction": "bullish", "confirmation": "candle_close"}},
        {"id": "3", "logicOperator": "AND", "condition": {"type": "supply_demand_zone", "zoneType": "demand", "freshness": "fresh", "timeframe": "15m"}}
      ],
      "exitConfig": {"stopLoss": {"type": "swing", "value": 3, "unit": "pips"}, "takeProfit": {"type": "opposite_liquidity", "value": 0, "unit": "pips", "partials": []}, "trailingStop": {"enabled": true, "activationPips": 50, "trailPips": 20}, "breakEven": {"enabled": true, "triggerPips": 25}},
      "riskConfig": {"accountBalance": 10000, "riskPerTrade": 0.5, "stopLossPips": 40, "maxConcurrentTrades": 2, "maxDailyLoss": 2, "maxDrawdown": 6}
    }'::jsonb
  ),
  (
    '11111111-1111-4000-8000-000000000003',
    'BOS + OTE Sniper Entry',
    'Precision entry using break of structure plus Fibonacci optimal trade entry',
    'forex',
    'GBP/USD',
    '{
      "timeframes": ["15m", "4H"],
      "conditions": [
        {"id": "1", "logicOperator": "AND", "condition": {"type": "break_of_structure", "bosType": "bullish", "requireBodyClose": true}},
        {"id": "2", "logicOperator": "AND", "condition": {"type": "optimal_trade_entry", "retracementLevels": [0.618, 0.705]}},
        {"id": "3", "logicOperator": "AND", "condition": {"type": "indicator_confluence", "rsiEnabled": true, "rsiThreshold": 30, "rsiCondition": "oversold", "volumeAboveAverage": true, "emaEnabled": false, "emaPeriod": 21, "emaCondition": "above"}}
      ],
      "exitConfig": {"stopLoss": {"type": "fixed", "value": 15, "unit": "pips"}, "takeProfit": {"type": "rr_ratio", "value": 3, "unit": "ratio", "partials": []}, "trailingStop": {"enabled": false, "activationPips": 30, "trailPips": 10}, "breakEven": {"enabled": true, "triggerPips": 10}},
      "riskConfig": {"accountBalance": 15000, "riskPerTrade": 1, "stopLossPips": 15, "maxConcurrentTrades": 3, "maxDailyLoss": 4, "maxDrawdown": 10}
    }'::jsonb
  ),
  (
    '11111111-1111-4000-8000-000000000004',
    'NY Session Breaker Block',
    'Trades breaker blocks during New York overlap for high-probability reversals',
    'forex',
    'USD/JPY',
    '{
      "timeframes": ["5m", "1H"],
      "conditions": [
        {"id": "1", "logicOperator": "AND", "condition": {"type": "session_filter", "sessions": ["new_york", "overlap"]}},
        {"id": "2", "logicOperator": "AND", "condition": {"type": "market_structure_shift", "direction": "bullish", "timeframe": "1H"}},
        {"id": "3", "logicOperator": "AND", "condition": {"type": "order_block", "obType": "bullish", "mustBeUnmitigated": true, "timeframe": "5m", "requireTap": true}},
        {"id": "4", "logicOperator": "AND", "condition": {"type": "fair_value_gap", "fvgType": "bullish", "minGapSize": 5, "gapSizeUnit": "pips", "requireFill": "none"}}
      ],
      "exitConfig": {"stopLoss": {"type": "below_ob", "value": 3, "unit": "pips"}, "takeProfit": {"type": "partial", "value": 0, "unit": "ratio", "partials": [{"percentage": 50, "rrRatio": 1}, {"percentage": 50, "rrRatio": 2}]}, "trailingStop": {"enabled": true, "activationPips": 20, "trailPips": 8}, "breakEven": {"enabled": false, "triggerPips": 15}},
      "riskConfig": {"accountBalance": 20000, "riskPerTrade": 1.5, "stopLossPips": 10, "maxConcurrentTrades": 2, "maxDailyLoss": 4, "maxDrawdown": 8}
    }'::jsonb
  ),
  (
    '11111111-1111-4000-8000-000000000005',
    'EQH Sweep + Supply Zone',
    'Fades equal highs liquidity pools with supply zone confirmation for short entries',
    'crypto',
    'ETH/USDT',
    '{
      "timeframes": ["15m", "4H"],
      "conditions": [
        {"id": "1", "logicOperator": "AND", "condition": {"type": "equal_highs_lows", "ehlType": "equal_highs", "minTouches": 3}},
        {"id": "2", "logicOperator": "AND", "condition": {"type": "liquidity_sweep", "direction": "buy-side", "lookbackPeriod": 100, "requireWickRejection": true}},
        {"id": "3", "logicOperator": "AND", "condition": {"type": "supply_demand_zone", "zoneType": "supply", "freshness": "fresh", "timeframe": "4H"}}
      ],
      "exitConfig": {"stopLoss": {"type": "atr", "value": 1.5, "unit": "multiplier"}, "takeProfit": {"type": "rr_ratio", "value": 2.5, "unit": "ratio", "partials": []}, "trailingStop": {"enabled": true, "activationPips": 40, "trailPips": 15}, "breakEven": {"enabled": true, "triggerPips": 20}},
      "riskConfig": {"accountBalance": 12000, "riskPerTrade": 1, "stopLossPips": 25, "maxConcurrentTrades": 2, "maxDailyLoss": 3, "maxDrawdown": 7}
    }'::jsonb
  )
ON CONFLICT (id) DO NOTHING;
