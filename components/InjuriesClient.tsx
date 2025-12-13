"use client";

import React from 'react';
import InjuriesList from './InjuriesList';

export default function InjuriesClient({ injuries, sport }: { injuries: any[]; sport: string }) {
  return <InjuriesList injuries={injuries} sport={sport} />;
}
