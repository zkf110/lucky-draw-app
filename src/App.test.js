import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';

function getPrizeSections() {
  return ['一等奖 (1名)', '二等奖 (10名)', '三等奖 (20名)'].map(name =>
    screen.getByRole('heading', { name }).closest('.prize-section')
  );
}

function getWinners(section) {
  return within(section).queryAllByText(/^\d+$/).map(number => Number(number.textContent));
}

async function advanceTime(milliseconds) {
  // Flush each awaited delay separately; one runAllTimers would also run the animation interval.
  await act(async () => {
    jest.advanceTimersByTime(milliseconds);
  });
  // Jest 27 counts queued microtasks too; drain React 19 act's awaited-call check.
  jest.runAllTicks();
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  cleanup();
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('renders the draw page with only third prize enabled initially', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: '浙江交通集团2026届校园招聘抽奖' })).toBeInTheDocument();
  const sections = getPrizeSections();
  const buttons = sections.map(section => within(section).getByRole('button'));

  expect(buttons[0]).toBeDisabled();
  expect(buttons[1]).toBeDisabled();
  expect(buttons[2]).toBeEnabled();
  sections.forEach(section => expect(within(section).getByText('暂无中奖者')).toBeInTheDocument());

  // Disabled higher-prize buttons must not start a draw out of order.
  fireEvent.click(buttons[0]);
  fireEvent.click(buttons[1]);
  expect(screen.queryByText('正在抽取幸运儿...')).not.toBeInTheDocument();
  expect(jest.getTimerCount()).toBe(0);
});

test.each([0, 0.5, 0.999999])('draws 20, 10 and 1 unique winners in order with random=%s', async random => {
  jest.spyOn(Math, 'random').mockReturnValue(random);
  render(<App />);

  const sections = getPrizeSections();
  const buttons = sections.map(section => within(section).getByRole('button'));
  const rounds = [
    { index: 2, count: 20, totals: [0, 0, 20], enabled: 1 },
    { index: 1, count: 10, totals: [0, 10, 20], enabled: 0 },
    { index: 0, count: 1, totals: [1, 10, 20], enabled: -1 },
  ];

  for (const round of rounds) {
    expect(buttons[round.index]).toBeEnabled();
    fireEvent.click(buttons[round.index]);

    expect(screen.getByText('正在抽取幸运儿...')).toBeInTheDocument();
    buttons.forEach(button => {
      expect(button).toBeDisabled();
      fireEvent.click(button); // No second draw may be queued while one is running.
    });

    await advanceTime(3000);
    for (let i = 0; i < round.count; i++) {
      expect(screen.getByText('正在抽取幸运儿...')).toBeInTheDocument();
      buttons.forEach(button => expect(button).toBeDisabled());
      await advanceTime(350);
    }

    expect(screen.queryByText('正在抽取幸运儿...')).not.toBeInTheDocument();
    expect(sections.map(section => getWinners(section).length)).toEqual(round.totals);
    buttons.forEach((button, index) => {
      if (index === round.enabled) expect(button).toBeEnabled();
      else expect(button).toBeDisabled();
    });
    expect(buttons[round.index]).toHaveTextContent('已抽完');

    const winners = sections.flatMap(getWinners);
    expect(new Set(winners).size).toBe(winners.length);
    expect(winners.every(number => Number.isInteger(number) && number >= 1 && number <= 200)).toBe(true);
    expect(jest.getTimerCount()).toBe(0);
  }

  buttons.forEach(button => {
    expect(button).toHaveTextContent('已抽完');
    expect(button).toBeDisabled();
    fireEvent.click(button);
  });
  expect(sections.flatMap(getWinners)).toHaveLength(31);
  expect(screen.queryByText('正在抽取幸运儿...')).not.toBeInTheDocument();
  expect(jest.getTimerCount()).toBe(0);
});
