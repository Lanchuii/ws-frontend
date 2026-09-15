import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAccessibleDialog } from './useAccessibleDialog';

const ExampleDialog = ({ onClose }: { onClose: () => void }) => {
  const dialogProps = useAccessibleDialog(onClose);
  return (
    <section {...dialogProps} aria-label="Example">
      <button type="button">First</button>
      <button type="button">Last</button>
    </section>
  );
};

describe('useAccessibleDialog', () => {
  it('focuses the dialog, traps tab focus, and closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ExampleDialog onClose={onClose} />);

    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    screen.getByRole('button', { name: 'Last' }).focus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'First' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });
});
