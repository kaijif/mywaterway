// @flow

import React from 'react';
import styled from 'styled-components';
import { GlossaryTerm } from 'components/shared/GlossaryPanel';

// --- styled components ---
const Container = styled.div``;
const Question = styled.strong`
  font-size: 1.2em;
`;

// --- components ---
type Props = {};

function AboutQuestions({ ...props }: Props) {
  return (
    <Container className="container">
      <h3>Questions and Answers about How’s My Waterway </h3>
      <hr />
      <p>
        <Question>What is “How’s My Waterway?”</Question>{' '}
        <em>How’s My Waterway</em> is an EPA tool that helps users find
        information on the condition of their waters quickly using a smart
        phone, tablet, or desktop computer. This information is displayed on 3
        scales; community, state, and national. This tool for technical and
        non-technical users offers easy access, a local-area focus,
        plain-English terms and descriptions (see glossary), and quickly
        accessible results within seconds based on the same comprehensive data
        found in several EPA databases (see <a href="/data">data page</a>).
      </p>

      <p>
        <Question>How can I use How’s My Waterway?</Question> Users can retrieve
        information on assessments and reported condition of local waters for
        anywhere in the nation by searching based on address, zipcode or place
        name (e.g. Mount Rushmore). Results include a list and map of the waters
        within a small watershed ({' '}
        <GlossaryTerm term="Watershed Names (HUC 12)">
          HUC 12 watershed
        </GlossaryTerm>
        ), including which waters are assessed and impaired or good based on the
        most recent state reporting under the Clean Water Act. Selecting a
        specific waterway from the list or map shows the impairment reported,
        existing restoration plans, and nonpoint source projects in the area.
        Information on permitted dischargers, water monitoring locations and
        drinking water systems can also be found within a small watershed area
        after entering a location.
      </p>

      <p>
        <Question>Why was How’s My Waterway developed?</Question>{' '}
        <em>How’s My Waterway</em> was developed to help users find basic
        information about the condition of their waterways and provides easy
        access to EPA’s comprehensive public water quality information. The main
        source of data comes from EPA’s national information system on water
        quality assessments -- ATTAINS -- a technical database designed for
        specialized scientific and technical uses. For many years, EPA has
        compiled valuable nationwide information on the condition of healthy and
        impaired waterways, gathered through Clean Water Act assessment and
        reporting by States and territories. To many Americans, however, one
        local lake or stream is a more important part of their lives than the
        thousands of waters described in our national statistics. Users can use
        their location or provide an address or area of interest to receive
        plain-English information about waters in their local watershed.
      </p>
      <p>
        Without being experts in water quality or databases, people have needed
        an easier way to learn about their local waters, their problems and why
        they matter, and what’s being done to improve conditions. Faced with a
        baffling array of scientific information and complex technical
        databases, an average citizen might say, “All I really want to know is,
        how’s MY waterway? And please tell me in words I understand.”
      </p>

      <p>
        <Question>What are the system requirements?</Question>{' '}
        <em>How’s My Waterway</em> is fully functional when accessed through
        browsers such as Firefox, Google Chrome, Internet Explorer and Safari
        using your desktop computer, tablet, or smart phone. It is
        platform-independent.
      </p>

      <p>
        <Question>Is How’s My Waterway a smart phone app?</Question> Actually it
        is a mobile-friendly tool -- a smart phone or tablet user can consult{' '}
        <em>How’s My Waterway</em> outdoors at the water’s edge, and retrieve
        information for that specific waterway with the “Use My Location”
        option, or search anywhere in the U.S. with the "Choose a Location"
        option. A smart phone user can save the <em>How’s My Waterway</em> link
        on their home screen and use it just like any other phone app. However,
        there is no app available through common app stores.
      </p>

      <p>
        <Question>
          More Questions?{' '}
          <a
            href="https://www.epa.gov/waterdata/forms/contact-us-about-hows-my-waterway"
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact us
          </a>
        </Question>
      </p>
    </Container>
  );
}

export default AboutQuestions;
