'use client'

import React from 'react'

interface HanokBezelFrameProps {
  children: React.ReactNode
  tagText?: string
}

export function HanokBezelFrame({ children, tagText = '축제 팝업' }: HanokBezelFrameProps) {
  // 글자 배열 (예: '축제 팝업' ➔ ['축', '제', '팝', '업'])
  const characters = tagText.split('')

  return (
    <div className="relative w-full max-w-md mx-auto p-4 sm:p-5 pt-8 sm:pt-10 transition-all duration-300">
      {/* 🏮 전통 한옥 테두리 베젤 (Scalloped Notch Corner & Double Line) */}
      <div className="absolute inset-0 pointer-events-none rounded-[28px] border-2 border-[#b88c56]/85 bg-[#FAF4EB]/90 backdrop-blur-md shadow-2xl overflow-hidden">
        {/* 안쪽 이중 액자선 */}
        <div className="absolute inset-2 rounded-[22px] border border-[#cfa976]/60 pointer-events-none" />

        {/* 4개 모퉁이 전통 한옥 노치(Scalloped Corners) SVG 구속 장식 */}
        {/* 좌상단 노치 */}
        <svg className="absolute top-0 left-0 size-7 sm:size-8 text-[#b88c56]" viewBox="0 0 32 32" fill="none">
          <path d="M 0,16 A 16,16 0 0,0 16,0 L 0,0 Z" fill="#FDFBF7" stroke="#b88c56" strokeWidth="2.5" />
        </svg>
        {/* 우상단 노치 */}
        <svg className="absolute top-0 right-0 size-7 sm:size-8 text-[#b88c56]" viewBox="0 0 32 32" fill="none">
          <path d="M 32,16 A 16,16 0 0,1 16,0 L 32,0 Z" fill="#FDFBF7" stroke="#b88c56" strokeWidth="2.5" />
        </svg>
        {/* 좌하단 노치 */}
        <svg className="absolute bottom-0 left-0 size-7 sm:size-8 text-[#b88c56]" viewBox="0 0 32 32" fill="none">
          <path d="M 0,16 A 16,16 0 0,1 16,32 L 0,32 Z" fill="#FDFBF7" stroke="#b88c56" strokeWidth="2.5" />
        </svg>
        {/* 우하단 노치 */}
        <svg className="absolute bottom-0 right-0 size-7 sm:size-8 text-[#b88c56]" viewBox="0 0 32 32" fill="none">
          <path d="M 32,16 A 16,16 0 0,0 16,32 L 32,32 Z" fill="#FDFBF7" stroke="#b88c56" strokeWidth="2.5" />
        </svg>

        {/* ☁️ 좌측/우측 전통 구름 띠 문양 (Cloud Motifs) */}
        <svg className="absolute left-[-2px] top-1/2 -translate-y-1/2 w-8 h-16 text-[#cfa976]/75 pointer-events-none" viewBox="0 0 40 64" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M0,16 Q18,6 26,18 Q34,30 20,40 Q10,48 0,44" strokeLinecap="round" />
          <path d="M0,26 Q12,20 18,26 Q24,32 12,38 Q4,42 0,38" strokeLinecap="round" />
        </svg>
        <svg className="absolute right-[-2px] bottom-1/3 w-8 h-16 text-[#cfa976]/75 scale-x-[-1] pointer-events-none" viewBox="0 0 40 64" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M0,16 Q18,6 26,18 Q34,30 20,40 Q10,48 0,44" strokeLinecap="round" />
          <path d="M0,26 Q12,20 18,26 Q24,32 12,38 Q4,42 0,38" strokeLinecap="round" />
        </svg>
      </div>

      {/* 📜 상단 좌측: 전통 족자 현판 ("축제 팝업") */}
      <div className="absolute top-[-6px] left-5 sm:left-6 z-40 flex flex-col items-center pointer-events-none drop-shadow-md">
        {/* 매달린 줄 */}
        <div className="w-[1.5px] h-3.5 bg-[#8B5E34]" />

        {/* 족자 본체 */}
        <div className="relative bg-[#FAF4EB] border border-[#a67c4e] shadow-md px-2 py-2 rounded-xs flex flex-col items-center justify-center min-w-[34px]">
          {/* 상단 족자 목봉 */}
          <div className="absolute -top-1.5 inset-x-[-4px] h-2 bg-[#6e4722] rounded-full shadow-xs border border-[#4a2e14]" />

          {/* 족자 세로 텍스트: 축제 팝업 */}
          <div className="font-serif font-black text-[#6e3e15] text-xs sm:text-xs tracking-wider flex flex-col items-center gap-0.5 select-none py-0.5">
            {characters.map((char, i) => (
              <span key={i} className="leading-tight font-extrabold">{char}</span>
            ))}
          </div>

          {/* 하단 족자 목봉 */}
          <div className="absolute -bottom-1.5 inset-x-[-4px] h-2 bg-[#6e4722] rounded-full shadow-xs border border-[#4a2e14]" />
        </div>

        {/* 족자 하단 술(노리개 수술 장식) */}
        <div className="flex flex-col items-center -mt-0.5">
          <div className="size-2 rounded-full bg-[#8B5E34] shadow-2xs" />
          <div className="w-[1.5px] h-4 bg-gradient-to-b from-[#8B5E34] via-[#a67c4e] to-transparent" />
        </div>
      </div>

      {/* 🏮 상단 우측: 전통 청사초롱 등불 (Lanterns) */}
      <div className="absolute top-[-2px] right-4 sm:right-6 z-40 flex items-start pointer-events-none drop-shadow-sm">
        {/* 걸이용 가로 곡선 실 줄 */}
        <svg className="w-20 sm:w-24 h-8 text-[#8B5E34]" viewBox="0 0 96 32" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M 0,2 Q 48,22 96,2" />
        </svg>

        {/* 은은한 작은 등불 1 */}
        <div className="absolute right-12 sm:right-14 top-3 flex flex-col items-center">
          <div className="w-[1.5px] h-2.5 bg-[#8B5E34]" />
          <div className="w-4 h-5 rounded-full bg-gradient-to-b from-amber-100 via-amber-200 to-orange-200 border border-[#ab7f4c] shadow-[0_0_10px_rgba(251,191,36,0.6)] flex items-center justify-center">
            <div className="size-1 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <div className="w-[1.5px] h-2.5 bg-[#8B5E34]" />
        </div>

        {/* 메인 청사초롱 등불 2 */}
        <div className="absolute right-3 sm:right-4 top-1 flex flex-col items-center">
          <div className="w-[1.5px] h-2.5 bg-[#8B5E34]" />
          <div className="w-6 sm:w-6.5 h-7 sm:h-7.5 rounded-lg bg-gradient-to-b from-rose-200 via-amber-100 to-sky-200 border border-[#8B5E34] shadow-[0_0_14px_rgba(251,191,36,0.7)] flex flex-col items-center justify-between p-0.5">
            <div className="w-full h-1 bg-[#6e4722]/60 rounded-xs" />
            <div className="size-1.5 rounded-full bg-amber-400 animate-ping" />
            <div className="w-full h-1 bg-[#6e4722]/60 rounded-xs" />
          </div>
          {/* 노리개 수술 */}
          <div className="w-[1.5px] h-3.5 bg-[#8B5E34]" />
        </div>
      </div>

      {/* 프레임 내부 배너 컨테이너 */}
      <div className="relative z-20 pt-2 sm:pt-3">
        {children}
      </div>
    </div>
  )
}
