import json
import requests
from bs4 import BeautifulSoup
import re
import time
import random
from urllib.parse import urljoin

class MCPServerScraper:
    def __init__(self, base_url):
        self.base_url = base_url
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.servers = []
        
    def fetch_page(self, url):
        """Fetch HTML content from a URL with retry mechanism"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = requests.get(url, headers=self.headers)
                response.raise_for_status()  # Raise exception for HTTP errors
                return response.text
            except requests.exceptions.RequestException as e:
                print(f"Error fetching {url}: {e}")
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt  # Exponential backoff
                    print(f"Retrying in {wait_time} seconds...")
                    time.sleep(wait_time)
                else:
                    print(f"Failed to fetch {url} after {max_retries} attempts")
                    return None
    
    def extract_server_urls(self, html_content):
        """Extract all MCP server page URLs from the main page"""
        if not html_content:
            return []
        
        soup = BeautifulSoup(html_content, 'html.parser')
        server_urls = []
        
        # Find all links that could be server pages
        links = soup.find_all('a', class_="BdEWC jEevvj jClhju koJNIU iWtjzs iVlkKm dGndpe jsLxaN bZRhvx JAEma gXlbfc bXBpoe ecmYYS bVhrBr jutHam entBuJ")
        for link in links:
            href = link.get('href', '')
            # Check if the link matches the pattern for MCP server pages
            if '/mcp/servers/' in href and 'tools' not in href:
                full_url = urljoin(self.base_url, href)
                server_urls.append(full_url)
        
        return list(set(server_urls))  # Remove duplicates
    
    def extract_server_info(self, url):
        """Extract information about a specific MCP server"""
        html_content = self.fetch_page(url)
        if not html_content:
            return None
        
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Extract server name - updated with correct class name
        name = "Unknown Server"
        name_tag = soup.find('h1', class_="jrhZjj jRXFuD jBowhj")
        if name_tag:
            name = name_tag.text.strip()
        else:
            # Fallback to any h1 tag
            h1_tags = soup.find_all('h1')
            if h1_tags:
                name = h1_tags[0].text.strip()
            else:
                # Final fallback to title
                title_tag = soup.find('title')
                if title_tag:
                    title_text = title_tag.text.strip()
                    name = title_text.replace(' - Glama', '').strip()
        
        # Extract URL - using the correct class name
        url_path = "/"
        github_url_tag = soup.find('a', class_='BdEWC jEevvj jClhju koJNIU iWtjzs iVlkKm gwoRtK hdQAFH gxojcW jsLxaN bZRhvx JAEma gXlbfc bXBpoe ecmYYS bVhrBr dBIADy ekFYIB gIcMub')
        if github_url_tag and 'href' in github_url_tag.attrs:
            url_path = github_url_tag['href'].strip()
        
        # Extract description - using the correct class name
        description = ""
        description_tag = soup.find('div', class_="bNpyBe eXSGnJ")
        if description_tag and description_tag.find('p'):
            description = description_tag.find('p').text.strip()
        else:
            # Fallback to any p tag
            p_tags = soup.find_all('p')
            if p_tags:
                description = p_tags[0].text.strip()
        
        # Extract author - using the correct class name
        author = "by unknown"
        author_tag = soup.find('div', class_="fPSBzf zlTvE jrIcfy")
        if author_tag and author_tag.find('span'):
            author = author_tag.find('span').text.strip()
        else:
            # Fallback pattern matching
            author_patterns = [
                re.compile(r'by\s+([^\n.,]+)', re.IGNORECASE),
                re.compile(r'Author[s]?[\s:]+([^\n.,]+)', re.IGNORECASE),
                re.compile(r'Created by\s+([^\n.,]+)', re.IGNORECASE)
            ]
            
            for pattern in author_patterns:
                match = pattern.search(html_content)
                if match:
                    author = f"by {match.group(1).strip()}"
                    break
        
        # Extract license - using the correct class name
        license = "MIT License"  # Default assumption
        license_tags = soup.find_all('div', class_='bYPztT czikZZ fPSBzf hnMRLK jsOvvq jrIcfy')
        if license_tags and len(license_tags) > 1:
            license = license_tags[1].text.strip()
        else:
            # Fallback pattern matching
            license_patterns = [
                re.compile(r'License[\s:]+([^\n.,<>]+)', re.IGNORECASE),
                re.compile(r'under the\s+([^\n.,<>]+)\s+license', re.IGNORECASE),
                re.compile(r'([A-Za-z0-9\s-]+)\s+license', re.IGNORECASE)
            ]
            
            for pattern in license_patterns:
                match = pattern.search(html_content)
                if match:
                    license = match.group(1).strip()
                    break
        
        # Extract tags - using the correct class name
        tags = []
        tags_tag = soup.find('ul', class_='czikZZ fPSBzf bAasmd jrIcfy')
        if tags_tag:
            tags = [tag.text.strip() for tag in tags_tag.find_all('li', class_='bYPztT eXSGnJ jDOzgL jsnJKs fPSBzf hnMRLK jmzEDN jrIcfy dTmriP')]
        
        # If no tags found, try to extract from content
        if not tags:
            # Common categories in MCP servers
            possible_categories = [
                "Security", "Developer Tools", "Databases", "Search", 
                "Communication", "File Systems", "Knowledge & Memory",
                "Cloud Platforms", "Note Taking", "OS Automation",
                "Image & Video Processing", "Speech Processing"
            ]
            
            for category in possible_categories:
                if category.lower() in html_content.lower():
                    tags.append(category)
        
        # If still no tags, add some defaults based on the description
        if not tags and description:
            if "security" in description.lower():
                tags.append("Security")
            if "develop" in description.lower() or "code" in description.lower():
                tags.append("Developer Tools")
            if "database" in description.lower() or "sql" in description.lower():
                tags.append("Databases")
            if "search" in description.lower():
                tags.append("Search")
        
        # Ensure we have at least one tag
        if not tags:
            tags = ["Developer Tools"]
        
        # Extract requirements
        requirements = {
            "node_version": "N/A",
            "api_key": "N/A"
        }
        
        # Look for the 'Requirements' section
        requirements_heading = soup.find('h2', id='requirements')
        if requirements_heading:
            requirements["node_version"] = requirements_heading.text.strip()
        else:
            # Try to extract node version requirement
            node_pattern = re.compile(r'Node(?:\.js)?\s+v?(\d+(?:\.\d+)*)', re.IGNORECASE)
            node_match = node_pattern.search(html_content)
            if node_match:
                requirements["node_version"] = f"Node.js v{node_match.group(1)}"
        
        # Extract API key requirement
        api_key_tag = soup.find('span', class_='api-key')
        if api_key_tag:
            requirements["api_key"] = api_key_tag.text.strip()
        elif "API key" in html_content or "apikey" in html_content.lower():
            requirements["api_key"] = "Required"
        
        # Get tools by visiting the tools page or extract from current page
        tools = []
        
        # First try to find tool sections on the current page
        tools_section = soup.find_all('ul', class_='fPSBzf bnYmbW jsnMfm jrPIxC')
        if tools_section:
            for tool in tools_section:
                tool_info = {}
                
                # Extract tool name
                tool_name_tag = tool.find('li')
                if tool_name_tag and tool_name_tag.find('a'):
                    tool_info['name'] = tool_name_tag.find('a').text.strip()
                else:
                    continue  # Skip tools without a name
                
                # Extract tool description
                tool_desc_tag = tool.find('p', class_='tool-description')
                if tool_desc_tag:
                    tool_info['description'] = tool_desc_tag.text.strip()
                else:
                    tool_info['description'] = "No description available"
                
                # Extract parameters and usage info
                parameters = tool.find_all('li', class_='param')
                usage_info = []
                if parameters:
                    usage_info = [param.text.strip() for param in parameters]
                
                tool_info['use'] = "\n".join(usage_info) if usage_info else "No specific usage information available"
                
                tools.append(tool_info)
        
        # If no tools found on the current page, try the tools page
        if not tools:
            tools_url = f"{url}/tools"
            tools = self.extract_tools(tools_url)
        
        # Create server info object
        server_info = {
            "name": name,
            "url": url_path,  # Using extracted URL or "/" as fallback
            "description": description,
            "author": author,
            "license": license,
            "tags": tags,
            "requirements": requirements,
            "tools": tools
        }
        
        return server_info
    
    def extract_tools(self, tools_url):
        """Extract tools information from a server's tools page"""
        html_content = self.fetch_page(tools_url)
        if not html_content:
            return []
        
        soup = BeautifulSoup(html_content, 'html.parser')
        tools = []
        
        # Find the tools table
        tool_tables = soup.find_all('table')
        for table in tool_tables:
            # Check if this is a tools table
            header = table.find('th')
            if header and 'Name' in header.text:
                # Find all tool rows
                rows = table.find_all('tr')[1:]  # Skip the header row
                for row in rows:
                    cells = row.find_all('td')
                    if len(cells) >= 2:
                        tool_name_cell = cells[0]
                        tool_desc_cell = cells[1]
                        
                        # Extract tool name
                        tool_name = tool_name_cell.text.strip()
                        tool_link = None
                        link_tag = tool_name_cell.find('a')
                        if link_tag:
                            tool_link = urljoin(tools_url, link_tag.get('href', ''))
                            
                        # Extract tool description
                        tool_description = tool_desc_cell.text.strip()
                        
                        # Get detailed tool info if possible
                        tool_info = {
                            "name": tool_name,
                            "description": tool_description,
                            "use": "No specific usage information available",
                            "input_schema": {}
                        }
                        
                        if tool_link:
                            detailed_info = self.extract_tool_details(tool_link)
                            if detailed_info:
                                tool_info.update(detailed_info)
                        
                        tools.append(tool_info)
        
        return tools

    def extract_tool_details(self, tool_url):
        """Extract detailed information about a specific tool"""
        html_content = self.fetch_page(tool_url)
        if not html_content:
            return None
        
        soup = BeautifulSoup(html_content, 'html.parser')
        tool_info = {}
        
        # Extract tool name (from h2 tag)
        h2_tag = soup.find('h2')
        if h2_tag:
            tool_info['name'] = h2_tag.text.strip()
        
        # Look for tool instructions/use
        instructions_heading = soup.find(['h3', 'h4'], text=re.compile(r'Instructions', re.IGNORECASE))
        if instructions_heading:
            next_element = instructions_heading.find_next('p')
            if next_element:
                tool_info['use'] = next_element.text.strip()
        
        # If no instructions found, try to find any detailed description
        if 'use' not in tool_info:
            description_tag = soup.find('p')
            if description_tag:
                tool_info['use'] = description_tag.text.strip()
        
        # Extract input schema information
        input_schema = {}
        
        # Look for the input schema table
        schema_heading = soup.find(['h3', 'h4'], text=re.compile(r'Input Schema', re.IGNORECASE))
        if schema_heading:
            # Find the next table after the heading
            schema_table = schema_heading.find_next('table')
            if schema_table:
                rows = schema_table.find_all('tr')[1:]  # Skip the header row
                for row in rows:
                    cells = row.find_all('td')
                    if len(cells) >= 3:  # Name, Required, Description
                        param_name = cells[0].text.strip()
                        param_required = cells[1].text.strip().lower() == 'yes'
                        param_description = cells[2].text.strip()
                        
                        # Add parameter to schema
                        input_schema[param_name] = {
                            "type": "string",  # Default to string since actual type info might not be available
                            "description": param_description,
                            "required": param_required
                        }
        
        # Alternative: Look for JSON Schema text
        if not input_schema:
            json_schema_heading = soup.find(['h3', 'h4'], text=re.compile(r'JSON Schema', re.IGNORECASE))
            if json_schema_heading:
                schema_text = None
                # Look for a pre or code element that might contain the schema
                pre_tag = json_schema_heading.find_next('pre')
                if pre_tag:
                    schema_text = pre_tag.text.strip()
                else:
                    code_tag = json_schema_heading.find_next('code')
                    if code_tag:
                        schema_text = code_tag.text.strip()
                
                # If we found schema text, try to parse it
                if schema_text:
                    try:
                        schema_json = json.loads(schema_text)
                        if 'properties' in schema_json:
                            # Convert the JSON schema format to our simplified format
                            for param_name, param_info in schema_json['properties'].items():
                                param_type = param_info.get('type', 'string')
                                param_description = param_info.get('description', '')
                                param_required = param_name in schema_json.get('required', [])
                                
                                input_schema[param_name] = {
                                    "type": param_type,
                                    "description": param_description,
                                    "required": param_required
                                }
                    except json.JSONDecodeError:
                        pass
        
        tool_info['input_schema'] = input_schema
        
        return tool_info

    def scrape_all_servers(self):
        """Scrape information about all MCP servers"""
        main_page_html = self.fetch_page(self.base_url)
        server_urls = self.extract_server_urls(main_page_html)
        
        print(f"Found {len(server_urls)} server URLs")
        
        for i, url in enumerate(server_urls):
            print(f"Scraping server {i+1}/{len(server_urls)}: {url}")
            server_info = self.extract_server_info(url)
            if server_info:
                self.servers.append(server_info)
                
            # Add a small delay to avoid overwhelming the server
            if i < len(server_urls) - 1:
                delay = random.uniform(0.5, 1.5)
                time.sleep(delay)
        
        return self.servers

    def save_to_json(self, filename="data.json"):
        """Save scraped server information to a JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.servers, f, indent=4, ensure_ascii=False)
        print(f"Data saved to {filename}")

def main():
    base_url = "https://glama.ai/mcp/servers"
    scraper = MCPServerScraper(base_url)
    
    print("Starting to scrape MCP servers...")
    servers = scraper.scrape_all_servers()
    
    print(f"Scraped {len(servers)} MCP servers")
    scraper.save_to_json()
    
    # Print sample data for verification
    if servers:
        print("\nSample data from first server:")
        print(json.dumps(servers[0], indent=4))

if __name__ == "__main__":
    main()


