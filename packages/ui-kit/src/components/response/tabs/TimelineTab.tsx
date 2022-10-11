import { FC } from 'react';
import { Editor } from '@firecamp/ui-kit';

const TimelineTab: FC<{ id: string; timeline: string }> = ({
  id,
  timeline,
}) => {
  return (
    <Editor
      disabled={true}
      value={timeline || ``}
      language="text"
      path={`${id}/response/timeline`}
      controlsConfig={{
        show: true,
      }}
      onLoad={(editor) => {
        editor.revealLine(1, true, true, function () {});
        editor.setPosition({ column: 1, lineNumber: 10 });
      }}
      monacoOptions={{
        name: `timeline`,
      }}
    />
  );
};
export default TimelineTab;
