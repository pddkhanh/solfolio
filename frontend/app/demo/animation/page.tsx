/**
 * Animation Demo Page
 * Test page to verify animation performance and functionality
 */

import { AnimationDemo } from '@/components/motion/AnimationDemo';
import { PageTransition } from '@/components/motion/PageTransition';

export default function AnimationDemoPage() {
  return (
    <PageTransition>
      <AnimationDemo />
    </PageTransition>
  );
}

export const metadata = {
  title: 'Animation Demo | SolFolio',
  description: 'Testing Framer Motion animations for SolFolio',
};