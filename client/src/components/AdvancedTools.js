import { Accordion, Card, Button } from 'react-bootstrap';
import { Tools, ChevronDown, Download, Upload } from 'react-bootstrap-icons';
import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import { useContext } from 'react';
import { FileContext } from '../context/FileContextProvider';
export const AdvancedTools = () => {
  const { fileRef, exportAsJson, readFile } = useContext(FileContext);
  const CustomToggle = ({ children, eventKey }) => {
    const decoratedOnClick = useAccordionButton(eventKey, () => {});

    return (
      <h4 as="button" onClick={decoratedOnClick} className={'mb-0'}>
        {children}
      </h4>
    );
  };
  return (
    <Accordion className={'mb-3'}>
      <Card>
        <Card.Header>
          <CustomToggle eventKey="0">
            <Tools size={25} /> Advanced tools {'  '}
            <ChevronDown size={20} />
          </CustomToggle>
        </Card.Header>
        <Accordion.Collapse eventKey="0">
          <Card.Body>
            <Button
              variant="primary"
              onClick={() => {
                fileRef.current.value = null;
                fileRef.current.click();
              }}
            >
              <input ref={fileRef} type="file" onChange={readFile} hidden />
              <Upload /> Import JSON
            </Button>{' '}
            <Button variant="primary" onClick={exportAsJson}>
              <Download /> Export all as JSON
            </Button>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    </Accordion>
  );
};
