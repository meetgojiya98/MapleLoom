---
{
  "title": "How to load Microsoft Office files",
  "source_url": "https://python.langchain.com/docs/how_to/document_loader_office_file/",
  "fetched_at": "2025-08-15T13:49:58.421273+00:00"
}
---

# How to load Microsoft Office files

How to load Microsoft Office files
The
Microsoft Office
suite of productivity software includes Microsoft Word, Microsoft Excel, Microsoft PowerPoint, Microsoft Outlook, and Microsoft OneNote. It is available for Microsoft Windows and macOS operating systems. It is also available on Android and iOS.
This covers how to load commonly used file formats including
DOCX
,
XLSX
and
PPTX
documents into a LangChain
Document
object that we can use downstream.
Loading DOCX, XLSX, PPTX with AzureAIDocumentIntelligenceLoader
​
Azure AI Document Intelligence
(formerly known as
Azure Form Recognizer
) is machine-learning
based service that extracts texts (including handwriting), tables, document structures (e.g., titles, section headings, etc.) and key-value-pairs from
digital or scanned PDFs, images, Office and HTML files. Document Intelligence supports
PDF
,
JPEG/JPG
,
PNG
,
BMP
,
TIFF
,
HEIF
,
DOCX
,
XLSX
,
PPTX
and
HTML
.
This
current implementation
of a loader using
Document Intelligence
can incorporate content page-wise and turn it into LangChain documents. The default output format is markdown, which can be easily chained with
MarkdownHeaderTextSplitter
for semantic document chunking. You can also use
mode="single"
or
mode="page"
to return pure texts in a single page or document split by page.
Prerequisite
​
An Azure AI Document Intelligence resource in one of the 3 preview regions:
East US
,
West US2
,
West Europe
- follow
this document
to create one if you don't have. You will be passing
<endpoint>
and
<key>
as parameters to the loader.
%
pip install
-
-
upgrade
-
-
quiet  langchain langchain
-
community azure
-
ai
-
documentintelligence
from
langchain_community
.
document_loaders
import
AzureAIDocumentIntelligenceLoader
file_path
=
"<filepath>"
endpoint
=
"<endpoint>"
key
=
"<key>"
loader
=
AzureAIDocumentIntelligenceLoader
(
api_endpoint
=
endpoint
,
api_key
=
key
,
file_path
=
file_path
,
api_model
=
"prebuilt-layout"
)
documents
=
loader
.
load
(
)
