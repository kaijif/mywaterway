// @flow

import React from 'react';
import { GlossaryTerm } from 'components/shared/GlossaryPanel';

// --- components ---
type Props = {};

function AboutInfo({ ...props }: Props) {
  return (
    <div className="container">
      <h3>About How’s My Waterway </h3>
      <hr />
      <p>
        <em>How's My Waterway</em>  was designed to provide the general public
        with information about the condition of their local waters based on data
        that states, federal, tribal, local agencies and others have provided to
        EPA. Water quality information is displayed on 3 scales in{' '}
        <em>How’s My Waterway</em>; community, state and national. More recent
        or more detailed water information may exist that is not yet available
        through EPA databases or other sources.{' '}
      </p>

      <h3> How’s My Waterway Glossary </h3>
      <hr />
      <p>
        <em>How’s My Waterway</em> provides an easily accessible plain-English
        glossary where you can search through definitions of terms used on the
        site. Various words are also hyperlinked throughout the site and will
        provide a definition pop up when clicked on. The full glossary can be
        found at the top of any page in <em>How’s My Waterway</em>.
      </p>

      <h3>How’s My Waterway Data </h3>
      <hr />
      <p>
        <em>How’s My Waterway </em>provides a <a href="/data">data page</a>{' '}
        which lists the sources of data displayed as well as where this data
        shows up throughout the tool. The data page can be found at the top of
        any page in <em>How’s My Waterway</em>.
      </p>

      <h3>Community Page </h3>
      <hr />
      <h5>About impairment reporting </h5>
      <p>
        The Clean Water Act requires States, Territories and authorized tribes
        (states for brevity) to monitor water impairments and report to EPA
        every two years on the waters they have evaluated. This process is
        called <GlossaryTerm term="assessment">assessment</GlossaryTerm>. Part
        of this process is deciding which waters do not meet{' '}
        <GlossaryTerm term="water quality standards">
          water quality standards
        </GlossaryTerm>
        . These waters are called{' '}
        <GlossaryTerm term="impaired">impaired</GlossaryTerm> (impaired enough
        to require action) and are placed on a State list for future actions to
        reduce pollution.  The local information displayed in{' '}
        <em>How's My Waterway </em>
        includes whether and when a waterway was assessed, which impairments may
        exist, and what has been done to improve conditions.
      </p>

      <h5>About water quality information </h5>
      <p>
        EPA's water databases are the largest single, national source of
        information about reported water quality problems and efforts to fix
        them. Other information not directly accessible in this tool exists in
        federal, State, local, and private sources. Some of these sources appear
        on the <a href="/data">data page</a>. Many waters in the US have not
        been assessed and sometimes there is little or no information reported
        about their condition. A waterway that has not been assessed may or may
        not be <GlossaryTerm term="impaired">impaired</GlossaryTerm>, and an
        impaired waterway may have more impairments than those that were
        measured and reported.
      </p>

      <h5>About impairment categories </h5>
      <p>
        A single waterway can have one or more types of impairments. When States
        report impaired waters, they put them in different categories. EPA uses
        major categories of water impairments in its national summary. There are
        more detailed subcategories within each of these. For example, the
        category "Metals" may include lead, cadmium, zinc, or copper as water
        pollutants. A filtering tool for these impairments can be found on the{' '}
        <a href="/data">data page</a>; which will allow you to find out the
        subcategories for the impairment. <em>How's My Waterway </em> provides
        simple descriptions of each major category, where the impairment comes
        from, its effect on the environment and on beneficial waterway uses,
        what citizens can do to help, and where to find more information. This
        information can be found in the glossary.
      </p>

      <h5>About what's being done </h5>
      <p>
        Identifying and reporting water impairments leads to action for
        improvement. Two major types of action taken under the Clean Water Act
        are{' '}
        <GlossaryTerm term="tmdl">
          Total Maximum Daily Load (TMDL) 
        </GlossaryTerm>{' '}
        restoration plans and{' '}
        <GlossaryTerm term="nonpoint source pollution">
          nonpoint source pollution
        </GlossaryTerm>{' '}
        projects. Tens of thousands of impaired waters now have a TMDL
        restoration plan, which is a 'reduced pollution diet' designed to help
        waters become healthy again. The TMDL serves as a basic game plan for a
        variety of different restoration activities, including watershed
        restoration plans. EPA provides funds to States to help control nonpoint
        source pollution, which generally originate from landscape runoff rather
        than a single discharge pipe. <em>How's My Waterway</em>
         identifies whether an impaired waterway has a TMDL restoration plan or
        a nonpoint source pollution project.
      </p>

      <h3>State Page </h3>
      <hr />
      <h5>State Water Quality Overview </h5>

      <p>
        You will find basic facts about a state’s waters (by the numbers), a
        paragraph about the state’s water quality program, a state-wide survey
        of overall water quality where available, state drinking water metrics,
        and summaries of specific water assessments for the state. Links are
        included to state websites containing more detail on water quality
        conditions. By choosing a topic, water type and use, the page will
        update based on the selections made. This page also provides documents
        that the state has submitted to EPA’s ATTAINS system as part of the
        state’s integrated report and statewide statistical surveys (if
        applicable). Nonpoint source success stories are also found on this page
        by state (if applicable).
      </p>

      <h5>Advanced Search</h5>

      <p>
        On this page you will be able to find the condition of waterbodies in
        your state all in one place. You can filter the data by 303(d) listed
        waters, all waters, impaired waters or find out which waters in the
        state have a TMDL. There is a filtering function to filter by different
        parameters (bacteria, acidity, abnormal flow, etc) and/or different use
        groups (aquatic life, fish and shellfish consumption, recreation, etc.).
        Results can be viewed on a map or in a list.
      </p>

      <h3>National Page </h3>
      <hr />
      <p>
        You will find information on the condition of water resources across the
        nation (lakes, rivers and streams, wetlands, and coastal areas), how
        these conditions have changed over time, and the main challenges to
        water resources nationwide. You will also find information about
        national drinking water and how to find out if your water is safe, the
        number of national systems in compliance and total population served.
      </p>
    </div>
  );
}

export default AboutInfo;
