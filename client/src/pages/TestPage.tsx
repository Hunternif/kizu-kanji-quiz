import { GameButton } from '../components/Buttons';
import { CenteredLayout } from '../components/layout/CenteredLayout';
import { VerticalGroup } from '../components/layout/VerticalGroup';
import { debounce, throttle } from '../shared/utils';

const debounced1Sec = debounce(
  () => console.log(`Debounced 1 seconds: ${new Date()}`),
  1000,
);
const debounced2Sec = debounce(
  () => console.log(`Debounced 2 seconds: ${new Date()}`),
  2000,
);
const debounced5Sec = debounce(
  () => console.log(`Debounced 5 seconds: ${new Date()}`),
  5000,
);

const throttled1Sec = throttle(
  () => console.log(`Throttled 1 seconds: ${new Date()}`),
  1000,
);
const throttled2Sec = throttle(
  () => console.log(`Throttled 2 seconds: ${new Date()}`),
  2000,
);
const throttled5Sec = throttle(
  () => console.log(`Throttled 5 seconds: ${new Date()}`),
  5000,
);

export function TestPage() {
  async function handleDebounceClick() {
    await debounced1Sec();
    await debounced2Sec();
    await debounced5Sec();
  }

  async function handleThrottleClick() {
    throttled1Sec();
    throttled2Sec();
    throttled5Sec();
  }

  // useEffectOnce(() => {
  //   window.addEventListener('mousedown', () => {
  //     // console.log(`Raw event. ${new Date()}`);
  //     debounced1Sec();
  //     debounced2Sec();
  //     debounced5Sec();
  //   });
  // });
  return (
    <CenteredLayout>
      <VerticalGroup>
        This will test your debounce & throttle.
        <GameButton onClick={handleDebounceClick}>Debounce</GameButton>
        <GameButton onClick={handleThrottleClick}>Throttle</GameButton>
      </VerticalGroup>
    </CenteredLayout>
  );
}
