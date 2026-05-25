import { exportToHtml } from '../src/utils/htmlExporter';
import type { Project } from '../src/types/project';
import type { Slide } from '../src/types/slide';
import type { KeyVisual } from '../src/types/keyvisual';
import * as fs from 'fs';

const kv: KeyVisual = {
  id: 'orange-black',
  name: '오렌지 블랙',
  backgroundColor: '#000000',
  gradientCss: 'radial-gradient(ellipse at center, rgba(26,13,0,0.4) 0%, #000 70%)',
  primaryColor: '#ffffff',
  secondaryColor: '#a0a0b0',
  accentColor: '#FF6B1A',
  fontFamily: "'Pretendard Variable', 'Pretendard', -apple-system, sans-serif",
};

const slides: Slide[] = [
  {
    id: '1', order: 0, label: '오프닝',
    template: 'title',
    data: {
      tag: 'RE:BUILD 2026',
      title: 'Reach × Trust × Convert = **Growth**',
      subtitle: '주대웅 · 리멤버 Market Solution 실장',
    },
    transition: 'fade', duration: 5000, entryAnimation: 'fadeUp',
  },
  {
    id: '2', order: 1, label: '자기소개',
    template: 'content',
    data: {
      tag: 'WHO I AM',
      title: 'Market Solution',
      body: '리멤버의 비즈니스 프로필을 기반으로\nB2B 기업의 **리서치, 마케팅, 세일즈**를\n해결하는 미션을 가지고 있습니다.',
    },
    transition: 'fade', duration: 5000, entryAnimation: 'fadeUp',
  },
  {
    id: '3', order: 2, label: '섹션 1',
    template: 'section-cover',
    data: { number: '01', title: 'Reach', subtitle: 'STAGE 01 · 도달 전략' },
    transition: 'fade', duration: 5000, entryAnimation: 'scaleIn',
  },
  {
    id: '4', order: 3, label: '고민',
    template: 'big-number',
    data: {
      tag: 'KEY QUESTION',
      number: '78%',
      title: 'B2B 마케터의 가장 큰 **고민**',
      body: '적합한 의사결정권자에게 도달하는 것이\n가장 어렵다고 응답',
    },
    transition: 'fade', duration: 5000, entryAnimation: 'scaleIn',
  },
  {
    id: '5', order: 4, label: '해결 방안',
    template: 'two-column',
    data: {
      tag: 'SOLUTION',
      title: '기존 방식 vs **리멤버 방식**',
      leftTitle: 'Before',
      leftBody: '불특정 다수에게 광고 노출\n낮은 전환율\n높은 CPA',
      rightTitle: 'After',
      rightBody: '**의사결정권자**만 타겟팅\n직무/직급 기반 정밀 도달\nCPA **65% 절감**',
    },
    transition: 'slide-left', duration: 5000, entryAnimation: 'fadeUp',
  },
  {
    id: '6', order: 5, label: '섹션 2',
    template: 'section-cover',
    data: { number: '02', title: 'Trust', subtitle: 'STAGE 02 · 신뢰 구축' },
    transition: 'fade', duration: 5000, entryAnimation: 'scaleIn',
  },
  {
    id: '7', order: 6, label: 'ABM 비교',
    template: 'comparison',
    data: {
      tag: 'A/B TEST',
      title: 'ABM 메시지 **A/B 테스트** 결과',
      leftLabel: 'CONTROL',
      leftContent: '일반적인 제품 소개 메시지\n기능 중심의 커뮤니케이션',
      leftMetricValue: '2.1%',
      leftMetricLabel: '전환율',
      rightLabel: 'ABM PERSONALIZED',
      rightContent: '**산업별 맞춤** 페인포인트 메시지\n의사결정권자 직급별 톤 조정',
      rightMetricValue: '12.8%',
      rightMetricLabel: '전환율',
      winner: 'right',
    },
    transition: 'fade', duration: 5000, entryAnimation: 'fadeUp',
  },
  {
    id: '8', order: 7, label: '프로세스',
    template: 'timeline',
    data: {
      tag: 'PROCESS',
      title: 'ABM **캠페인 프로세스**',
      steps: [
        { stage: 'STEP 01', title: '타겟 리서치', detail: 'ICP 정의 및\n타겟 리스트 구축', metric: '2주', highlight: false },
        { stage: 'STEP 02', title: '콘텐츠 제작', detail: '산업별 맞춤\n메시지 설계', metric: '1주', highlight: false },
        { stage: 'STEP 03', title: '멀티채널 실행', detail: '이메일 + 광고 +\nDM 동시 집행', metric: '4주', highlight: true },
        { stage: 'STEP 04', title: '성과 분석', detail: 'Engagement\nKPI 리뷰', metric: '1주', highlight: false },
      ],
    },
    transition: 'slide-left', duration: 5000, entryAnimation: 'fadeUp',
  },
  {
    id: '9', order: 8, label: '섹션 3',
    template: 'section-cover',
    data: { number: '03', title: 'Convert', subtitle: 'STAGE 03 · 전환 성과' },
    transition: 'fade', duration: 5000, entryAnimation: 'scaleIn',
  },
  {
    id: '10', order: 9, label: '핵심 성과',
    template: 'metrics',
    data: {
      tag: 'RESULTS',
      title: '캠페인 **핵심 성과**',
      metrics: [
        { value: '320%', label: 'ROI 증가' },
        { value: '6.1x', label: '전환율 개선' },
        { value: '₩4.2B', label: '파이프라인' },
        { value: '89%', label: '고객 만족도' },
      ],
    },
    transition: 'fade', duration: 5000, entryAnimation: 'scaleIn',
  },
  {
    id: '11', order: 10, label: '사례',
    template: 'cards',
    data: {
      tag: 'SUCCESS CASES',
      title: '고객 **성공 사례**',
      cards: [
        { title: 'NHN클라우드', body: 'ABM 캠페인으로\n**MQL 240%** 증가\n파이프라인 ₩1.2B 확보', highlight: false },
        { title: '한화 키퍼', body: '타겟 계정 **전환율 8.7%**\n업계 평균 대비 4.2배\nCAC 58% 절감', highlight: true },
        { title: 'LG유플러스', body: '의사결정권자 도달률\n**92%** 달성\n계약 체결 기간 40% 단축', highlight: false },
      ],
    },
    transition: 'fade', duration: 5000, entryAnimation: 'fadeUp',
  },
  {
    id: '12', order: 11, label: '인용',
    template: 'quote',
    data: {
      tag: 'INSIGHT',
      quote: '**B2B 마케팅**의 본질은\n적합한 사람에게, 적합한 메시지를,\n적합한 타이밍에 전달하는 것',
      attribution: '— 주대웅, 리멤버 Market Solution',
    },
    transition: 'dissolve', duration: 5000, entryAnimation: 'fadeIn',
  },
  {
    id: '13', order: 12, label: '엔딩',
    template: 'outro',
    data: {
      title: 'Thank You',
      subtitle: 'Reach × Trust × Convert = Growth',
      contactInfo: 'daewung@rememberapp.co.kr\nremember.co.kr',
    },
    transition: 'fade', duration: 5000, entryAnimation: 'fadeUp',
  },
];

const project: Project = {
  id: 'sample-rebuild',
  name: 'RE:BUILD 2026',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  screen: {
    id: 'default-16x4', name: '기본 대형 스크린', widthMm: 16000, heightMm: 4000,
    widthPx: 7680, heightPx: 1920, aspectRatio: '4:1',
  },
  layout: {
    id: 'single', name: '단일 영역',
    zones: [{ id: 'main', label: '메인', x: 0, y: 0, width: 100, height: 100 }],
  },
  keyVisual: kv,
  slides,
  backgroundEffect: 'starfield',
};

const html = exportToHtml(project);
fs.writeFileSync('/tmp/sample-rebuild.html', html);
console.log(`Generated: ${html.length} bytes → /tmp/sample-rebuild.html`);
