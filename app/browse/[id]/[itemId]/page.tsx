"use client"
import { useParams } from 'next/navigation'
import React from 'react'

const page = () => {
  const params = useParams();
  const itemId = params.itemId;
  return (
    <div>{itemId}</div>
  )
}

export default page