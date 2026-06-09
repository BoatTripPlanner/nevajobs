"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import {
  currencyFromZona,
  type BillingCurrency,
} from "@/lib/billing/currency";
import {
  getVisitorBillingZone,
  readGeoCountryCookie,
} from "@/lib/i18n/geo-billing";
import type { ZonaEconomica } from "@/types";

export function useVisitorBilling() {
  const locale = useLocale();
  const [zona, setZona] = useState<ZonaEconomica>("UE");
  const [currency, setCurrency] = useState<BillingCurrency>("EUR");

  useEffect(() => {
    const country = readGeoCountryCookie();
    const nextZona = getVisitorBillingZone(country);
    setZona(nextZona);
    setCurrency(currencyFromZona(nextZona));
  }, [locale]);

  return { zona, currency, locale };
}
