"""Currency and pay period standardization logic."""
from typing import Optional, Tuple

# Known currency conversion rates to INR (baseline target)
# Clearly documented conversion benchmarks
EXCHANGE_RATES_TO_INR = {
    "INR": 1.0,
    "USD": 83.5,
    "EUR": 90.5,
    "GBP": 105.8,
    "CAD": 61.2,
    "AUD": 54.5,
    "SGD": 62.0
}

# Pay period multipliers to annualize salary
# 40 hours/week * 52 weeks = 2,080 annual working hours
PERIOD_MULTIPLIERS = {
    "annual": 1.0,
    "yearly": 1.0,
    "year": 1.0,
    "monthly": 12.0,
    "month": 12.0,
    "hourly": 2080.0,
    "hour": 2080.0,
    "daily": 260.0
}

def standardize_salary(
    sal_min: Optional[float],
    sal_max: Optional[float],
    currency: Optional[str],
    period: Optional[str],
    target_currency: str = "INR"
) -> Tuple[Optional[float], Optional[float], Optional[float], bool, str]:
    """
    Converts salary to a consistent annual amount in target currency.
    
    Rules:
    - Never assume an unknown/missing currency is INR or USD.
    - If currency or period is missing/unrecognized, return (None, None, None, False, reason).
    - If sal_min or sal_max is 0 or negative without valid range, handle gracefully.
    - Preserves distinct status: is_valid indicates whether reliable annual salary could be calculated.
    
    Returns:
        (annual_min, annual_max, annual_avg, is_valid, note)
    """
    if sal_min is None and sal_max is None:
        return None, None, None, False, "Salary undisclosed / missing"
    
    if not currency or str(currency).strip().upper() not in EXCHANGE_RATES_TO_INR:
        return None, None, None, False, f"Unknown or missing currency: '{currency}'"
        
    curr = str(currency).strip().upper()
    rate_to_inr = EXCHANGE_RATES_TO_INR[curr]
    target_rate = EXCHANGE_RATES_TO_INR.get(target_currency.upper(), 1.0)
    conversion_factor = rate_to_inr / target_rate
    
    norm_period = str(period).strip().lower() if period else "annual"
    if norm_period not in PERIOD_MULTIPLIERS:
        return None, None, None, False, f"Unknown pay period: '{period}'"
        
    multiplier = PERIOD_MULTIPLIERS[norm_period]
    
    # Calculate numeric values
    val_min = float(sal_min) if (sal_min is not None and sal_min > 0) else None
    val_max = float(sal_max) if (sal_max is not None and sal_max > 0) else None
    
    if val_min is None and val_max is None:
        return None, None, None, False, "Zero or negative salary values"
        
    # If one bound is missing, impute from the other
    if val_min is None:
        val_min = val_max
    if val_max is None:
        val_max = val_min
        
    # Standardize bounds order
    if val_min > val_max:
        val_min, val_max = val_max, val_min
        
    annual_min = round(val_min * multiplier * conversion_factor, 2)
    annual_max = round(val_max * multiplier * conversion_factor, 2)
    annual_avg = round((annual_min + annual_max) / 2.0, 2)
    
    # Outlier detection (e.g. < 50,000 INR or > 50,000,000 INR annual)
    if target_currency.upper() == "INR":
        if annual_avg < 50_000:
            return annual_min, annual_max, annual_avg, False, "Below minimum realistic annual wage threshold"
        if annual_avg > 50_000_000:
            return annual_min, annual_max, annual_avg, False, "Exceeds realistic annual salary upper threshold"
            
    return annual_min, annual_max, annual_avg, True, "Successfully annualized and converted"
